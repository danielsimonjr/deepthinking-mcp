import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: process.env.SKIP_BENCHMARKS
      ? ['**/node_modules/**', '**/benchmarks/**', '**/.claude/worktrees/**']
      : ['**/node_modules/**', '**/.claude/worktrees/**'],
    // NOTE on GC: tests/performance/memory.test.ts needs a real gc() to make
    // its heapUsed deltas meaningful. Passing `--expose-gc` via poolOptions
    // execArgv does NOT work here -- worker_threads rejects that flag, so
    // global.gc stayed undefined. The test acquires gc itself via
    // v8.setFlagsFromString instead; see forceGC() there.
    // Configure reporters: default console output + custom per-file reporter
    reporters: [
      'default',
      './tests/test-results/per-file-reporter.js',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/tests/**',
      ],
    },
  },
});
