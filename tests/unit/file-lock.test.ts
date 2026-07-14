/**
 * file-lock.ts Unit Tests
 *
 * Proves in-process mutual exclusion for `acquireLock`/`withLock`.
 *
 * Background (data-loss bug): `acquireExclusiveLock` used to treat any lock
 * whose `instanceId` matched the current process's `INSTANCE_ID` as already
 * held by the caller ("re-entrant") and granted access immediately. Because
 * `INSTANCE_ID` is a single constant computed once per process, EVERY
 * concurrent async caller in the same process shares it — so the very first
 * caller to acquire the lock caused every other concurrent caller to be
 * waved through too, with zero mutual exclusion between them. That let
 * concurrent `FileSessionStore.saveSession()` calls race on
 * read-modify-write of `metadata/index.json`, silently losing sessions from
 * the index under load (see tests/unit/file-store.test.ts's
 * 'should handle concurrent saves').
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import * as path from "path";
import * as os from "os";
import { acquireLock, withLock, isLocked } from "../../src/utils/file-lock.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("file-lock", () => {
  let tempDir: string;
  let targetFile: string;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `deepthinking-lock-test-${randomUUID()}`);
    await fs.mkdir(tempDir, { recursive: true });
    targetFile = path.join(tempDir, "target.json");
    await fs.writeFile(targetFile, "{}", "utf-8");
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  });

  describe("in-process mutual exclusion", () => {
    it("never allows two concurrent same-process holders of an exclusive lock", async () => {
      const N = 8;
      let active = 0;
      let maxActive = 0;
      let completed = 0;

      await Promise.all(
        Array.from({ length: N }, () =>
          withLock(
            targetFile,
            async () => {
              active++;
              maxActive = Math.max(maxActive, active);
              // Hold the "critical section" long enough that any other
              // caller granted access concurrently would provably overlap.
              await sleep(30);
              active--;
              completed++;
            },
            { timeout: 10000, retryInterval: 10 },
          ),
        ),
      );

      // The core mutual-exclusion invariant: at most one holder at a time.
      expect(maxActive).toBe(1);
      // Every caller must eventually get its turn — none silently skipped.
      expect(completed).toBe(N);
    }, 20000);

    it("serializes writers so the last writer sees all prior writes (no lost updates)", async () => {
      await fs.writeFile(targetFile, "[]", "utf-8");
      const N = 10;
      const seen: number[] = [];

      await Promise.all(
        Array.from({ length: N }, (_, i) =>
          withLock(
            targetFile,
            async () => {
              // Read-modify-write, mimicking FileSessionStore's metadata
              // index update pattern.
              const current = JSON.parse(await fs.readFile(targetFile, "utf-8")) as number[];
              await sleep(5); // widen the window between read and write
              current.push(i);
              await fs.writeFile(targetFile, JSON.stringify(current), "utf-8");
            },
            { timeout: 10000, retryInterval: 10 },
          ),
        ),
      );

      const final = JSON.parse(await fs.readFile(targetFile, "utf-8")) as number[];
      seen.push(...final);

      // With real mutual exclusion, every writer's increment must survive.
      expect(seen.sort((a, b) => a - b)).toEqual(
        Array.from({ length: N }, (_, i) => i).sort((a, b) => a - b),
      );
    }, 20000);

    it("fully releases the lock after each holder so isLocked reflects reality", async () => {
      const N = 5;
      await Promise.all(
        Array.from({ length: N }, () =>
          withLock(targetFile, async () => sleep(5), {
            timeout: 10000,
            retryInterval: 10,
          }),
        ),
      );

      const status = await isLocked(targetFile);
      expect(status.locked).toBe(false);
    }, 20000);
  });

  describe("attempt isolation", () => {
    it("does not leave stray .tmp files behind after concurrent acquisitions", async () => {
      const N = 12;
      await Promise.all(
        Array.from({ length: N }, () =>
          withLock(targetFile, async () => sleep(5), {
            timeout: 10000,
            retryInterval: 10,
          }),
        ),
      );

      const lockDir = path.dirname(targetFile);
      const entries = await fs.readdir(lockDir);
      const strayTmp = entries.filter((e) => e.includes(".tmp"));
      expect(strayTmp).toEqual([]);
    }, 20000);
  });

  describe("basic behaviour (regression safety net)", () => {
    it("acquireLock returns a working release function", async () => {
      const release = await acquireLock(targetFile);
      const status = await isLocked(targetFile);
      expect(status.locked).toBe(true);
      expect(status.type).toBe("exclusive");
      await release();
      const statusAfter = await isLocked(targetFile);
      expect(statusAfter.locked).toBe(false);
    });
  });
});
