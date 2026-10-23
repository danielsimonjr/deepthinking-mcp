/**
 * Temporary diagnostic: finds which call raises a non-ENOENT error in the
 * shared-lock cleanup race. Removed before the fix merges.
 */

import { describe, it } from "vitest";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import * as path from "path";
import * as os from "os";
import { withSharedLock } from "../../src/utils/file-lock.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface Seen {
  count: number;
  sample: Record<string, unknown>;
}

describe("diag: shared-lock failures", () => {
  it("collects every failure with its syscall and stack", async () => {
    const budgetMs = Number(process.env.DIAG_MS ?? 180000);
    const readers = Number(process.env.DIAG_READERS ?? 40);
    const stagger = Number(process.env.DIAG_STAGGER ?? 3);
    const seen = new Map<string, Seen>();
    let rounds = 0;
    let settled = 0;
    const started = Date.now();

    while (Date.now() - started < budgetMs) {
      const tempDir = path.join(os.tmpdir(), `diag-lock-${randomUUID()}`);
      await fs.mkdir(tempDir, { recursive: true });
      const targetFile = path.join(tempDir, "target.json");
      await fs.writeFile(targetFile, "{}", "utf-8");
      for (let r = 0; r < 25 && Date.now() - started < budgetMs; r++) {
        const results = await Promise.allSettled(
          Array.from({ length: readers }, async (_, i) => {
            await sleep(i % stagger);
            return withSharedLock(targetFile, async () => i, {
              timeout: 5000,
              retryInterval: 5,
            });
          }),
        );
        rounds++;
        settled += results.length;
        for (const x of results) {
          if (x.status !== "rejected") continue;
          const e = x.reason as NodeJS.ErrnoException;
          const key = `${e?.code}|${e?.syscall}`;
          const entry = seen.get(key) ?? {
            count: 0,
            sample: {
              code: e?.code,
              errno: e?.errno,
              syscall: e?.syscall,
              path: e?.path,
              message: e?.message,
              stack: e?.stack,
            },
          };
          entry.count++;
          seen.set(key, entry);
        }
      }
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }

    process.stdout.write(
      `DIAG_SUMMARY ${JSON.stringify({
        node: process.version,
        platform: process.platform,
        release: os.release(),
        readers,
        stagger,
        rounds,
        settled,
        seconds: Math.round((Date.now() - started) / 1000),
        failures: [...seen.entries()].map(([key, v]) => ({ key, ...v })),
      })}\n`,
    );
  }, 600000);

  it("records what the kernel answers to an exclusive create racing an rmdir", async () => {
    const budgetMs = Number(process.env.MICRO_MS ?? 90000);
    const base = path.join(os.tmpdir(), `diag-micro-${randomUUID()}`);
    await fs.mkdir(base, { recursive: true });
    const dir = path.join(base, "d.locks");
    const counts = new Map<string, number>();
    const bump = (key: string) => counts.set(key, (counts.get(key) ?? 0) + 1);
    const stopAt = Date.now() + budgetMs;
    let n = 0;
    const maker = (async () => {
      while (Date.now() < stopAt) {
        await fs.mkdir(dir, { recursive: true }).catch(() => {});
      }
    })();
    const remover = (async () => {
      while (Date.now() < stopAt) {
        await fs.rmdir(dir).catch(() => {});
      }
    })();
    const creators = Array.from({ length: 8 }, async (_, k) => {
      while (Date.now() < stopAt) {
        const file = path.join(dir, `${k}-${n++}.lock`);
        try {
          await fs.writeFile(file, "x", { flag: "wx" });
          bump("ok");
          await fs.unlink(file).catch(() => {});
        } catch (error) {
          const e = error as NodeJS.ErrnoException;
          bump(`${e.code}|${e.syscall}`);
        }
      }
    });
    await Promise.all([maker, remover, ...creators]);
    await fs.rm(base, { recursive: true, force: true }).catch(() => {});
    process.stdout.write(
      `MICRO_SUMMARY ${JSON.stringify({
        node: process.version,
        platform: process.platform,
        release: os.release(),
        counts: Object.fromEntries(counts),
      })}\n`,
    );
  }, 300000);
});
