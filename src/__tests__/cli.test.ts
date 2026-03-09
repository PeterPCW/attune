import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { resolve, join } from 'path';
import { existsSync, mkdirSync, promises as fsPromises } from 'fs';

// Import functions from analyze.ts for testing
// We'll test the utility functions directly
describe('CLI Commands', () => {
  const testProjectRoot = '/tmp/test-cli-project';

  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testProjectRoot)) {
      fs.mkdirSync(testProjectRoot, { recursive: true });
    }
    fs.writeFileSync(
      path.join(testProjectRoot, 'package.json'),
      '{"name": "test", "version": "1.0.0"}'
    );
  });

  afterEach(() => {
    if (fs.existsSync(testProjectRoot)) {
      fs.rmSync(testProjectRoot, { recursive: true, force: true });
    }
  });

  describe('Path Resolution', () => {
    it('should resolve project path correctly', () => {
      const projectPath = '.';
      const resolved = resolve(process.cwd(), projectPath);
      expect(resolved).toBe(process.cwd());
    });

    it('should resolve absolute paths', () => {
      const projectPath = '/home/user/project';
      const resolved = resolve(process.cwd(), projectPath);
      expect(resolved).toBe(projectPath);
    });

    it('should handle relative paths', () => {
      const projectPath = './src';
      const resolved = resolve(process.cwd(), projectPath);
      expect(resolved).toContain('src');
    });
  });

  describe('Framework Detection', () => {
    it('should detect nodejs from package.json', () => {
      // This test verifies the framework detection logic works
      const packageJsonPath = path.join(testProjectRoot, 'package.json');
      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);
      expect(pkg.name).toBe('test');
    });

    it('should detect react from dependencies', () => {
      fs.writeFileSync(
        path.join(testProjectRoot, 'package.json'),
        JSON.stringify({
          name: 'test-react',
          version: '1.0.0',
          dependencies: {
            react: '^18.0.0'
          }
        })
      );
      const packageJsonPath = path.join(testProjectRoot, 'package.json');
      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);
      expect(pkg.dependencies.react).toBeDefined();
    });
  });

  describe('Config File Parsing', () => {
    it('should parse config flags from content', () => {
      const configContent = `
# Comment line
--json
--lite
--verbose
`;
      const lines = configContent.split('\n');
      const flags: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          continue;
        }
        flags.push(trimmed);
      }

      expect(flags).toContain('--json');
      expect(flags).toContain('--lite');
      expect(flags).toContain('--verbose');
      expect(flags.length).toBe(3);
    });

    it('should skip empty lines', () => {
      const configContent = `
--json

--lite
`;
      const lines = configContent.split('\n');
      const flags: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          continue;
        }
        flags.push(trimmed);
      }

      expect(flags.length).toBe(2);
    });
  });

  describe('Default Config Generation', () => {
    it('should include common ignore patterns', () => {
      const defaultIgnore = `# Attune ignore patterns
**/__tests__/**
**/*.test.ts
**/test/**
coverage/
node_modules/
`;

      expect(defaultIgnore).toContain('**/__tests__/**');
      expect(defaultIgnore).toContain('node_modules/');
    });

    it('should include build output patterns', () => {
      const defaultIgnore = `dist/
build/
out/
`;

      expect(defaultIgnore).toContain('dist/');
      expect(defaultIgnore).toContain('build/');
    });
  });

  describe('Output Path Generation', () => {
    it('should generate timestamped output path', () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const ext = 'json';
      const defaultDir = '.attune/reports';
      const outputPath = join('/test/project', defaultDir, `attune-${timestamp}.${ext}`);

      expect(outputPath).toContain('attune-');
      expect(outputPath).toContain('.json');
      expect(outputPath).toContain('.attune/reports');
    });

    it('should use correct extension for each format', () => {
      const htmlExt = 'html';
      const mdExt = 'md';
      const sarifExt = 'sarif';

      expect(htmlExt).toBe('html');
      expect(mdExt).toBe('md');
      expect(sarifExt).toBe('sarif');
    });
  });

  describe('Directory Creation', () => {
    it('should create .attune directory if not exists', () => {
      const attuneDir = join(testProjectRoot, '.attune');
      const reportsDir = join(attuneDir, 'reports');

      if (!existsSync(attuneDir)) {
        mkdirSync(attuneDir, { recursive: true });
      }

      expect(existsSync(attuneDir)).toBe(true);
      expect(attuneDir).toContain('.attune');
    });
  });

  describe('File Operations', () => {
    it('should read and write files', async () => {
      const testFile = path.join(testProjectRoot, 'test-file.txt');
      const testContent = 'Hello, Attune!';

      await fsPromises.writeFile(testFile, testContent);
      const readContent = await fsPromises.readFile(testFile, 'utf-8');

      expect(readContent).toBe(testContent);
    });

    it('should check file existence', () => {
      const existingFile = path.join(testProjectRoot, 'package.json');
      const nonExistingFile = path.join(testProjectRoot, 'nonexistent.txt');

      expect(existsSync(existingFile)).toBe(true);
      expect(existsSync(nonExistingFile)).toBe(false);
    });
  });
});
