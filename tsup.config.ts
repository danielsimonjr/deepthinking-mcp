import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  shims: true,
  target: 'node18',
  outDir: 'dist',
  splitting: false,
  treeshake: true,
});
