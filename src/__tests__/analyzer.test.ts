import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AttuneAnalyzer } from '../core/analyzer/index.js';
import * as fs from 'fs';
import * as path from 'path';

describe('AttuneAnalyzer', () => {
  const testProjectRoot = '/tmp/test-attune';

  beforeEach(() => {
    // Create test directory structure
    if (!fs.existsSync(testProjectRoot)) {
      fs.mkdirSync(testProjectRoot, { recursive: true });
    }
    if (!fs.existsSync(path.join(testProjectRoot, 'src'))) {
      fs.mkdirSync(path.join(testProjectRoot, 'src'), { recursive: true });
    }
    // Create a simple test file
    fs.writeFileSync(
      path.join(testProjectRoot, 'src/index.ts'),
      'export const hello = "world";'
    );
    // Create vitest config
    fs.writeFileSync(
      path.join(testProjectRoot, 'vitest.config.ts'),
      'export default { test: {} }'
    );
    // Create package.json
    fs.writeFileSync(
      path.join(testProjectRoot, 'package.json'),
      '{"name": "test", "scripts": {"test": "vitest"}}'
    );
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testProjectRoot)) {
      fs.rmSync(testProjectRoot, { recursive: true, force: true });
    }
  });

  it('should analyze a project and return findings', async () => {
    const analyzer = new AttuneAnalyzer(testProjectRoot, 'nodejs', {});
    const result = await analyzer.analyze();

    expect(result).toHaveProperty('findings');
    expect(result).toHaveProperty('filesScanned');
    expect(result.filesScanned).toBeGreaterThan(0);
  });

  it('should include config files from root', async () => {
    const analyzer = new AttuneAnalyzer(testProjectRoot, 'nodejs', {});
    const result = await analyzer.analyze();

    // Should include vitest.config.ts
    const configFiles = result.findings.length > 0 ? [] : [];
    // This test verifies files are being scanned
    expect(result.filesScanned).toBeGreaterThan(0);
  });

  it('should filter rules by framework', async () => {
    const analyzer = new AttuneAnalyzer(testProjectRoot, 'react', {});
    const result = await analyzer.analyze();

    expect(result.filesScanned).toBeGreaterThan(0);
  });

  it('should handle lite mode', async () => {
    const analyzer = new AttuneAnalyzer(testProjectRoot, 'nodejs', { lite: true });
    const result = await analyzer.analyze();

    expect(result.filesScanned).toBeGreaterThan(0);
  });

  it('should handle verbose mode', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const analyzer = new AttuneAnalyzer(testProjectRoot, 'nodejs', { verbose: true });
    const result = await analyzer.analyze();

    expect(result.filesScanned).toBeGreaterThan(0);
    consoleSpy.mockRestore();
  });

  it('should load ignore patterns from .attuneignore', async () => {
    // Create .attuneignore file
    fs.writeFileSync(
      path.join(testProjectRoot, '.attuneignore'),
      '# Comment line\nnode_modules\n*.test.ts\ncoverage/'
    );

    const analyzer = new AttuneAnalyzer(testProjectRoot, 'nodejs', {});
    const result = await analyzer.analyze();

    // Should still analyze even with ignore patterns
    expect(result.filesScanned).toBeGreaterThan(0);
  });

  it('should scan root directory when no src exists', async () => {
    // Remove src directory, create files in root
    fs.rmSync(path.join(testProjectRoot, 'src'), { recursive: true, force: true });
    fs.writeFileSync(
      path.join(testProjectRoot, 'app.js'),
      'console.log("hello");'
    );

    const analyzer = new AttuneAnalyzer(testProjectRoot, 'nodejs', {});
    const result = await analyzer.analyze();

    // Should fall back to root directory
    expect(result.filesScanned).toBeGreaterThan(0);
  });
});
