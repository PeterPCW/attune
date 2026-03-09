import { defineConfig } from 'tsup';
import { copy } from 'esbuild-plugin-copy';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [],
  banner: {
    js: '#!/usr/bin/env node\n'
  },
  plugins: [
    copy({
      resolveFrom: 'cwd',
      assets: {
        from: ['src/rules/data/*.json'],
        to: ['dist/rules/data'],
      },
    }),
  ]
});
