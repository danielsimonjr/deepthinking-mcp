import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  // Declarations come from tsc, not tsup: rollup-plugin-dts needs TypeScript's
  // programmatic Compiler API, which TS 7.0 does not ship. tsup's bundling is
  // esbuild and is unaffected. See the build script.
  dts: false,
  sourcemap: true,
  clean: true,
  shims: true,
  target: 'node18',
  outDir: 'dist',
  splitting: false,
  treeshake: true,
});
