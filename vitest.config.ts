import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: process.env.SKIP_BENCHMARKS
      ? ['**/node_modules/**', '**/benchmarks/**']
      : ['**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
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
