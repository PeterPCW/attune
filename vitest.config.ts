import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Only run tests from src directory, exclude test-repos
    include: ['src/__tests__/**/*.test.ts'],
  },
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: [
      'node_modules/**',
      'dist/**',
      '**/*.test.ts',
      '**/*.config.ts',
      // Rules are now JSON + helpers - JSON is data not code, helpers are tested
      'src/rules/**',
      // CLI and entry points - tested via integration
      'src/cli/**',
      'src/index.ts',
      // External/extension directories
      'mcp-server/**',
      'vscode-extension/**',
      'scripts/**',
      // Types only - type definitions
      'src/types/**',
      // Test repos (external projects used for testing attune)
      'test-repos/**',
    ],
    // Coverage thresholds - raised for production quality
    thresholds: {
      lines: 60,
      functions: 70,
      branches: 75,
      statements: 60
    }
  }
});
