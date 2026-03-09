import { describe, it, expect } from 'vitest';
import { AnalysisContext } from '../types/index.js';
import { TestingRules } from '../rules/testing/index.js';

describe('Testing Rules', () => {
  const createContext = (files: { path: string; content: string }[]): AnalysisContext => ({
    projectRoot: '/test',
    framework: 'nodejs',
    files,
    packageJson: null
  });

  describe('TestCoverageConfigRule', () => {
    it('should detect missing test configuration', () => {
      const rules = TestingRules.getRules();
      const rule = rules.find(r => r.id === 'TEST_COVERAGE_CONFIG')!;

      const context = createContext([{
        path: '/test/package.json',
        content: `{"scripts": {"test": "vitest"}}`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0); // Should find the package.json
    });

    it('should pass when vitest config exists', () => {
      const rules = TestingRules.getRules();
      const rule = rules.find(r => r.id === 'TEST_COVERAGE_CONFIG')!;

      const context = createContext([{
        path: '/test/vitest.config.ts',
        content: `export default defineConfig({ test: { environment: 'node' } })`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBe(0);
    });

    it('should pass when jest config exists', () => {
      const rules = TestingRules.getRules();
      const rule = rules.find(r => r.id === 'TEST_COVERAGE_CONFIG')!;

      const context = createContext([{
        path: '/test/jest.config.js',
        content: `module.exports = { testEnvironment: 'node' }`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBe(0);
    });
  });

  describe('TestCoverageThresholdsRule', () => {
    it('should detect missing coverage thresholds in vitest', () => {
      const rules = TestingRules.getRules();
      const rule = rules.find(r => r.id === 'TEST_COVERAGE_THRESHOLDS')!;

      const context = createContext([{
        path: '/test/vitest.config.ts',
        content: `export default defineConfig({ coverage: { provider: 'v8' } })`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBe(1);
      expect(findings[0].ruleId).toBe('TEST_COVERAGE_THRESHOLDS');
    });

    it('should pass when thresholds are configured', () => {
      const rules = TestingRules.getRules();
      const rule = rules.find(r => r.id === 'TEST_COVERAGE_THRESHOLDS')!;

      const context = createContext([{
        path: '/test/vitest.config.ts',
        content: `export default defineConfig({ coverage: { thresholds: { lines: 80 } } })`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBe(0);
    });

    it('should detect missing coverage thresholds in jest', () => {
      const rules = TestingRules.getRules();
      const rule = rules.find(r => r.id === 'TEST_COVERAGE_THRESHOLDS')!;

      const context = createContext([{
        path: '/test/jest.config.js',
        content: `module.exports = { collectCoverage: true }`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBe(1);
    });
  });

  describe('TestCoverageLowRule', () => {
    it('should detect low coverage from coverage JSON', async () => {
      const rules = TestingRules.getRules();
      const rule = rules.find(r => r.id === 'TEST_COVERAGE_LOW')!;

      // Create a temp coverage file for testing
      const os = await import('os');
      const path = await import('path');
      const fs = await import('fs');
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'attune-test-'));
      const coveragePath = path.join(tmpDir, 'coverage', 'coverage-final.json');

      // Create coverage directory and file
      fs.mkdirSync(path.dirname(coveragePath), { recursive: true });
      fs.writeFileSync(coveragePath, JSON.stringify({
        all: {
          // 1 out of 3 = 33.33% - below 60% threshold
          s: { 1: 1, 2: 0, 3: 0 },
          b: { 1: [1, 0], 2: [0, 0] },
          f: { 1: 1, 2: 0, 3: 0 },
          statementMap: { 1: {}, 2: {}, 3: {} }
        }
      }));

      const context = createContext([{
        path: '/test/package.json',
        content: '{}'
      }]);

      // Override projectRoot to use temp directory
      context.projectRoot = tmpDir;

      const findings = rule.detect(context);
      // With 2 out of 3 statements covered = 66%, should be below 60% threshold
      expect(findings.length).toBe(1);
      expect(findings[0].ruleId).toBe('TEST_COVERAGE_LOW');

      // Cleanup
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('should pass when coverage is above threshold', async () => {
      const rules = TestingRules.getRules();
      const rule = rules.find(r => r.id === 'TEST_COVERAGE_LOW')!;

      // Create a temp coverage file for testing
      const os = await import('os');
      const path = await import('path');
      const fs = await import('fs');
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'attune-test-'));
      const coveragePath = path.join(tmpDir, 'coverage', 'coverage-final.json');

      // Create coverage directory and file with high coverage
      fs.mkdirSync(path.dirname(coveragePath), { recursive: true });
      fs.writeFileSync(coveragePath, JSON.stringify({
        all: {
          s: { 1: 1, 2: 1, 3: 1, 4: 1 },
          b: { 1: [1, 1], 2: [1, 1] },
          f: { 1: 1, 2: 1, 3: 1 },
          statementMap: { 1: {}, 2: {}, 3: {}, 4: {} }
        }
      }));

      const context = createContext([{
        path: '/test/package.json',
        content: '{}'
      }]);

      // Override projectRoot to use temp directory
      context.projectRoot = tmpDir;

      const findings = rule.detect(context);
      // 100% coverage should pass
      expect(findings.length).toBe(0);

      // Cleanup
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
  });
});
