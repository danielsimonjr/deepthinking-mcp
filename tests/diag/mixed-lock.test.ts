/**
 * Temporary diagnostic: mixes shared readers, exclusive writers, isLocked polls and
 * forceUnlock calls, and records the code, syscall and stack of every rejection per
 * operation. Removed before the fix merges.
 */

import { describe, it } from "vitest";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import * as path from "path";
import * as os from "os";
import {
  withSharedLock,
  withLock,
  isLocked,
  forceUnlock,
} from "../../src/utils/file-lock.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface Seen {
  count: number;
  sample: Record<string, unknown>;
}

describe("diag: mixed lock operations", () => {
  it("collects every rejection per operation", async () => {
    const budgetMs = Number(process.env.DIAG_MS ?? 180000);
    const readers = Number(process.env.DIAG_READERS ?? 40);
    const force = process.env.DIAG_FORCE === "1";
    const seen = new Map<string, Seen>();
    const totals: Record<string, number> = {};
    let rounds = 0;
    const started = Date.now();

    const record = (op: string, ok: boolean, reason?: unknown) => {
      totals[op] = (totals[op] ?? 0) + 1;
      if (ok) return;
      const e = reason as NodeJS.ErrnoException;
      const key = `${op}|${e?.code}|${e?.syscall}|${String(e?.message).slice(0, 40)}`;
      const entry = seen.get(key) ?? {
        count: 0,
        sample: {
          code: e?.code,
          errno: e?.errno,
          syscall: e?.syscall,
          message: String(e?.message).slice(0, 200),
          stack: String(e?.stack).split("\n").slice(0, 6).join(" | "),
        },
      };
      entry.count++;
      seen.set(key, entry);
    };

    const run = async (op: string, fn: () => Promise<unknown>) => {
      try {
        await fn();
        record(op, true);
      } catch (error) {
        record(op, false, error);
      }
    };

    while (Date.now() - started < budgetMs) {
      const tempDir = path.join(os.tmpdir(), `diag-mixed-${randomUUID()}`);
      await fs.mkdir(tempDir, { recursive: true });
      const targetFile = path.join(tempDir, "target.json");
      await fs.writeFile(targetFile, "{}", "utf-8");
      for (let r = 0; r < 25 && Date.now() - started < budgetMs; r++) {
        const jobs: Promise<void>[] = [];
        for (let i = 0; i < readers; i++) {
          jobs.push(
            (async () => {
              await sleep(i % 3);
              await run("shared", () =>
                withSharedLock(targetFile, async () => i, {
                  timeout: 5000,
                  retryInterval: 5,
                }),
              );
            })(),
          );
        }
        for (let i = 0; i < 3; i++) {
          jobs.push(
            (async () => {
              await sleep(i % 3);
              await run("exclusive", () =>
                withLock(targetFile, async () => i, {
                  timeout: 5000,
                  retryInterval: 5,
                }),
              );
            })(),
          );
        }
        for (let i = 0; i < 6; i++) {
          jobs.push(
            (async () => {
              await sleep(i % 3);
              await run("isLocked", () => isLocked(targetFile));
            })(),
          );
        }
        if (force) {
          for (let i = 0; i < 2; i++) {
            jobs.push(
              (async () => {
                await sleep(i + 1);
                await run("forceUnlock", () => forceUnlock(targetFile));
              })(),
            );
          }
        }
        await Promise.all(jobs);
        rounds++;
      }
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }

    process.stdout.write(
      `MIXED_SUMMARY ${JSON.stringify({
        node: process.version,
        platform: process.platform,
        readers,
        force,
        rounds,
        seconds: Math.round((Date.now() - started) / 1000),
        totals,
        failures: [...seen.entries()].map(([key, v]) => ({ key, ...v })),
      })}\n`,
    );
  }, 600000);
});
