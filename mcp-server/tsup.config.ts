import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  bundle: true,
  external: ['attune'],
  banner: {
    js: `#!/usr/bin/env node`,
  },
});
