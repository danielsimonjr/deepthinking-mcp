import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: process.env.SKIP_BENCHMARKS
      ? ['**/node_modules/**', '**/benchmarks/**']
      : ['**/node_modules/**'],
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
