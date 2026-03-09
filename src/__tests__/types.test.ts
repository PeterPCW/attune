import { describe, it, expect } from 'vitest';
import {
  Finding,
  AnalysisContext,
  Framework,
  Category,
  Severity,
  Recommendation,
  CliOptions,
  ScanMetadata,
  ScanResult,
  DetectionRule,
  SourceFile
} from '../types/index.js';

describe('Types', () => {
  describe('Finding', () => {
    it('should create a finding with all properties', () => {
      const finding: Finding = {
        id: 'TEST_RULE',
        severity: 'medium',
        category: 'security',
        file: '/test/file.ts',
        line: 10,
        message: 'Test message',
        code: 'const x = 1;',
        recommendation: {
          title: 'Test recommendation',
          description: 'Test description',
          library: 'test-lib'
        }
      };

      expect(finding.id).toBe('TEST_RULE');
      expect(finding.severity).toBe('medium');
      expect(finding.category).toBe('security');
    });
  });

  describe('AnalysisContext', () => {
    it('should create an analysis context', () => {
      const context: AnalysisContext = {
        projectRoot: '/test',
        framework: 'nodejs',
        files: [],
        packageJson: null
      };

      expect(context.projectRoot).toBe('/test');
      expect(context.framework).toBe('nodejs');
    });
  });

  describe('Enums and Types', () => {
    it('should have valid Framework values', () => {
      const frameworks: Framework[] = [
        'react', 'nextjs', 'vue', 'nuxt', 'svelte', 'angular',
        'astro', 'remix', 'solidjs', 'express', 'fastify',
        'trpc', 'nodejs'
      ];

      expect(frameworks.length).toBe(13);
    });

    it('should have valid Category values', () => {
      const categories: Category[] = [
        'security', 'testing', 'architecture', 'performance',
        'accessibility', 'typescript'
      ];

      expect(categories.length).toBe(6);
    });

    it('should have valid Severity values', () => {
      const severities: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];

      expect(severities.length).toBe(5);
    });
  });

  describe('CliOptions', () => {
    it('should create cli options with defaults', () => {
      const options: CliOptions = {
        lite: false,
        full: false
      };

      expect(options.lite).toBe(false);
    });

    it('should allow all options to be set', () => {
      const options: CliOptions = {
        lite: true,
        full: true,
        security: true,
        architecture: true,
        performance: true,
        testing: true,
        framework: 'react',
        json: true,
        markdown: true,
        sarif: true,
        verbose: true
      };

      expect(options.lite).toBe(true);
      expect(options.framework).toBe('react');
    });
  });

  describe('ScanMetadata', () => {
    it('should create scan metadata', () => {
      const metadata: ScanMetadata = {
        projectRoot: '/test',
        framework: 'nodejs',
        scanTime: 100,
        filesScanned: 10,
        rulesRun: 5
      };

      expect(metadata.filesScanned).toBe(10);
      expect(metadata.rulesRun).toBe(5);
    });
  });

  describe('ScanResult', () => {
    it('should create scan result', () => {
      const result: ScanResult = {
        findings: [],
        filesScanned: 10
      };

      expect(result.filesScanned).toBe(10);
    });
  });

  describe('DetectionRule', () => {
    it('should have required properties', () => {
      const rule: DetectionRule = {
        id: 'TEST_RULE',
        name: 'Test Rule',
        category: 'security',
        severity: 'medium',
        frameworks: [],
        detect: () => []
      };

      expect(rule.id).toBe('TEST_RULE');
      expect(rule.category).toBe('security');
    });
  });

  describe('SourceFile', () => {
    it('should create a source file', () => {
      const file: SourceFile = {
        path: '/test/file.ts',
        content: 'export const x = 1;'
      };

      expect(file.path).toBe('/test/file.ts');
      expect(file.content).toContain('export');
    });

    it('should allow ast property', () => {
      const file: SourceFile = {
        path: '/test/file.ts',
        content: 'export const x = 1;',
        ast: { type: 'Program' }
      };

      expect(file.ast).toBeDefined();
    });
  });
});
