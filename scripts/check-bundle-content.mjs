/**
 * Fail when a committed build file under dist/ differs from a fresh build of src/.
 *
 * The plugin starts dist/index.js (see cli/mcp-server-wrapper.mjs), so the committed
 * build is what users run. A build that lags the source passes every test that reads
 * the source. This check builds into a temporary folder with the same steps as
 * `bun run build` (tsup, then tsc for the declarations) and compares the bytes of
 * each file that git tracks under dist/. The committed files are not written. The scratch
 * folder (.bundle-check-*) is removed in both outcomes.
 *
 * The build must be deterministic: the same source and lockfile give the same bytes.
 * Run `bun install --frozen-lockfile` first so that the dependencies match the lockfile.
 *
 * Usage: node scripts/check-bundle-content.mjs
 *   BUNDLE_CHECK_TIMEOUT_MS  Milliseconds allowed for each build step. Default: 300000.
 * Exit 0 when every tracked file matches, 1 otherwise.
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BUILD_DIR = 'dist';
const BUILD_TIMEOUT_MS = Number(process.env.BUNDLE_CHECK_TIMEOUT_MS ?? 300000);
const EXCERPT_BYTES = 60;
const REBUILD_HINT =
  'Run `bun install --frozen-lockfile` and `bun run build`, then commit the rebuilt files under dist/.';

const require = createRequire(import.meta.url);

/**
 * Returns the path of a package's command-line script, read from its bin field.
 * @param {string} pkg
 * @param {string} name
 * @returns {string}
 */
function binScript(pkg, name) {
  const manifestPath = require.resolve(`${pkg}/package.json`);
  const manifest = require(manifestPath);
  const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.[name];
  if (!bin) throw new Error(`package ${pkg} has no bin named ${name}`);
  return join(manifestPath, '..', bin);
}

/**
 * Runs a Node script in the repository root and throws when it fails.
 * @param {string} script
 * @param {string[]} args
 * @param {string} label
 */
function runStep(script, args, label) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: BUILD_TIMEOUT_MS,
    windowsHide: true,
  });
  if (result.error || result.status !== 0) {
    const detail = (result.error?.message ?? result.stderr ?? '').trim().slice(0, 400);
    throw new Error(`${label} failed (status ${result.status})${detail ? `: ${detail}` : ''}`);
  }
}

/**
 * Lists the files that git tracks under the build folder, relative to that folder.
 * @returns {string[]}
 */
function trackedBuildFiles() {
  const result = spawnSync('git', ['ls-files', '-z', '--', BUILD_DIR], {
    cwd: ROOT,
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`git ls-files failed: ${(result.stderr ?? '').trim()}`);
  }
  const prefix = `${BUILD_DIR}/`;
  const files = result.stdout
    .split('\0')
    .filter((path) => path.startsWith(prefix))
    .map((path) => path.slice(prefix.length));
  if (files.length === 0) {
    throw new Error(`git tracks no file under ${BUILD_DIR}/; nothing to compare`);
  }
  return files;
}

/**
 * Finds the first byte at which two buffers differ.
 * @param {Buffer} committed
 * @param {Buffer} fresh
 * @returns {number | null} The byte offset (from 0), or null when the buffers are equal.
 */
export function firstDifferenceOffset(committed, fresh) {
  const shared = Math.min(committed.length, fresh.length);
  let offset = 0;
  while (offset < shared && committed[offset] === fresh[offset]) offset += 1;
  if (offset === shared && committed.length === fresh.length) return null;
  return offset;
}

/**
 * Describes the first difference between two buffers for a person to read.
 * @param {Buffer} committed
 * @param {Buffer} fresh
 * @param {number} offset
 * @returns {string}
 */
function describeDifference(committed, fresh, offset) {
  const line = committed.subarray(0, offset).toString('utf8').split('\n').length;
  const excerpt = (buffer) =>
    JSON.stringify(
      buffer.subarray(Math.max(0, offset - EXCERPT_BYTES / 2), offset + EXCERPT_BYTES / 2).toString('utf8'),
    );
  const sizes =
    committed.length === fresh.length
      ? ''
      : ` (committed ${committed.length} bytes, fresh ${fresh.length} bytes)`;
  return `line ${line}, byte ${offset}${sizes}: committed ${excerpt(committed)}; fresh ${excerpt(fresh)}`;
}

function main() {
  let tempFolder = null;
  try {
    const files = trackedBuildFiles();
    // A direct child of the root. The source map records paths relative to the output
    // folder, so a folder at another depth (the OS temp folder) builds a different map.
    tempFolder = mkdtempSync(join(ROOT, '.bundle-check-'));

    runStep(binScript('tsup', 'tsup'), ['--out-dir', tempFolder], 'tsup build');
    runStep(
      binScript('typescript', 'tsc'),
      ['--emitDeclarationOnly', '--outDir', tempFolder],
      'tsc declarations',
    );

    const mismatches = [];
    for (const file of files) {
      const committedPath = join(ROOT, BUILD_DIR, file);
      const freshPath = join(tempFolder, file);
      if (!existsSync(freshPath)) {
        mismatches.push(`${BUILD_DIR}/${file}: the fresh build did not produce this file`);
        continue;
      }
      const committed = readFileSync(committedPath);
      const fresh = readFileSync(freshPath);
      const offset = firstDifferenceOffset(committed, fresh);
      if (offset !== null) {
        mismatches.push(`${BUILD_DIR}/${file} differs from a fresh build at ${describeDifference(committed, fresh, offset)}`);
      }
    }

    if (mismatches.length > 0) {
      console.error(mismatches.join('\n'));
      console.error(REBUILD_HINT);
      process.exitCode = 1;
      return;
    }
    console.log(`${files.length} committed build file(s) under ${BUILD_DIR}/ match a fresh build`);
  } catch (error) {
    console.error(`bundle content check failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (tempFolder !== null) {
      try {
        rmSync(tempFolder, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
      } catch (error) {
        console.warn(`could not remove ${tempFolder}: ${error.message}`);
      }
    }
  }
}

main();
