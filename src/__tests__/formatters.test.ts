import { describe, it, expect } from 'vitest';
import { Finding, ScanMetadata } from '../types/index.js';
import { formatJson } from '../formatters/json.js';
import { formatMarkdown } from '../formatters/markdown.js';
import { formatTerminal } from '../formatters/terminal.js';
import { formatHtml } from '../formatters/html.js';
import { formatSarif } from '../formatters/sarif.js';

describe('Formatters', () => {
  const mockFindings: Finding[] = [
    {
      id: 'TEST-1',
      ruleId: 'TEST',
      severity: 'high',
      category: 'security',
      file: '/test/file.ts',
      line: 10,
      message: 'Test finding',
      code: 'const x = 1;',
      recommendation: {
        title: 'Test recommendation',
        description: 'Test description',
        library: 'test-lib'
      }
    }
  ];

  const mockMetadata: ScanMetadata = {
    projectRoot: '/test',
    framework: 'nodejs',
    scanTime: 100,
    filesScanned: 10,
    rulesRun: 5
  };

  describe('JSON Formatter', () => {
    it('should format findings as JSON', () => {
      const result = formatJson(mockFindings, mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty('version');
      expect(parsed).toHaveProperty('metadata');
      expect(parsed).toHaveProperty('summary');
      expect(parsed).toHaveProperty('findings');
      expect(parsed.findings.length).toBe(1);
    });

    it('should include scan metadata', () => {
      const result = formatJson(mockFindings, mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.metadata.projectRoot).toBe('/test');
      expect(parsed.metadata.framework).toBe('nodejs');
      expect(parsed.metadata.filesScanned).toBe(10);
    });

    it('should calculate summary correctly', () => {
      const result = formatJson(mockFindings, mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.summary.total).toBe(1);
      expect(parsed.summary.high).toBe(1);
    });
  });

  describe('Markdown Formatter', () => {
    it('should format findings as Markdown', () => {
      const result = formatMarkdown(mockFindings, mockMetadata);

      expect(result).toContain('# Attune Report');
      expect(result).toContain('**Project:**');
      expect(result).toContain('**Framework:**');
    });

    it('should include project info', () => {
      const result = formatMarkdown(mockFindings, mockMetadata);

      expect(result).toContain('/test');
      expect(result).toContain('nodejs');
    });
  });

  describe('Terminal Formatter', () => {
    it('should format findings for terminal', () => {
      const result = formatTerminal(mockFindings, mockMetadata);

      expect(result).toContain('Attune');
      expect(result).toContain('Project:');
    });

    it('should handle empty findings', () => {
      const result = formatTerminal([], mockMetadata);

      expect(result).toContain('No issues found');
    });

    it('should group findings by severity', () => {
      const findings: Finding[] = [
        {
          id: 'TEST-1',
          ruleId: 'TEST',
          severity: 'critical',
          category: 'security',
          file: '/test/file.ts',
          line: 10,
          message: 'Critical issue',
          code: ''
        },
        {
          id: 'TEST-2',
          ruleId: 'TEST',
          severity: 'low',
          category: 'security',
          file: '/test/file.ts',
          line: 20,
          message: 'Low issue',
          code: ''
        }
      ];

      const result = formatTerminal(findings, mockMetadata);

      expect(result).toContain('Critical');
      expect(result).toContain('Low');
    });
  });

  describe('HTML Formatter', () => {
    it('should format findings as HTML', () => {
      const result = formatHtml(mockFindings, mockMetadata);

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html');
      expect(result).toContain('Attune');
    });

    it('should calculate score correctly', () => {
      const result = formatHtml(mockFindings, mockMetadata);

      expect(result).toContain('score');
      expect(result).toContain('%');
    });

    it('should include project and framework info', () => {
      const result = formatHtml(mockFindings, mockMetadata);

      expect(result).toContain('/test');
      expect(result).toContain('nodejs');
    });

    it('should render severity badges', () => {
      const result = formatHtml(mockFindings, mockMetadata);

      expect(result).toContain('severity-high');
    });

    it('should handle empty findings with perfect score', () => {
      const result = formatHtml([], mockMetadata);

      expect(result).toContain('100');
      expect(result).toContain('perfect-icon');
    });

    it('should include pie chart for findings', () => {
      const result = formatHtml(mockFindings, mockMetadata);

      expect(result).toContain('<svg');
    });

    it('should handle multiple severity levels', () => {
      const findings: Finding[] = [
        {
          id: 'TEST-1',
          ruleId: 'TEST',
          severity: 'critical',
          category: 'security',
          file: '/test/file.ts',
          line: 10,
          message: 'Critical issue',
          code: ''
        },
        {
          id: 'TEST-2',
          ruleId: 'TEST',
          severity: 'high',
          category: 'security',
          file: '/test/file.ts',
          line: 20,
          message: 'High issue',
          code: ''
        },
        {
          id: 'TEST-3',
          ruleId: 'TEST',
          severity: 'medium',
          category: 'code-quality',
          file: '/test/file2.ts',
          line: 30,
          message: 'Medium issue',
          code: ''
        },
        {
          id: 'TEST-4',
          ruleId: 'TEST',
          severity: 'low',
          category: 'best-practices',
          file: '/test/file3.ts',
          line: 40,
          message: 'Low issue',
          code: ''
        }
      ];

      const result = formatHtml(findings, mockMetadata);

      expect(result).toContain('severity-critical');
      expect(result).toContain('severity-high');
      expect(result).toContain('severity-medium');
      expect(result).toContain('severity-low');
      expect(result).toContain('category-badge');
    });

    it('should include category breakdown', () => {
      const result = formatHtml(mockFindings, mockMetadata);

      expect(result).toContain('category-badge');
    });
  });

  describe('SARIF Formatter', () => {
    it('should format findings as SARIF', () => {
      const result = formatSarif(mockFindings, mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty('version');
      expect(parsed).toHaveProperty('runs');
      expect(parsed.runs).toHaveLength(1);
    });

    it('should include tool driver info', () => {
      const result = formatSarif(mockFindings, mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.runs[0].tool.driver.name).toBe('Attune');
      expect(parsed.runs[0].tool.driver.version).toBe('1.0.0');
    });

    it('should map severity to SARIF levels', () => {
      const criticalFinding: Finding[] = [
        {
          id: 'TEST-1',
          ruleId: 'CRITICAL',
          severity: 'critical',
          category: 'security',
          file: '/test/file.ts',
          line: 10,
          message: 'Critical issue',
          code: ''
        }
      ];

      const result = formatSarif(criticalFinding, mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.runs[0].results[0].level).toBe('error');
    });

    it('should map high severity to error', () => {
      const highFinding: Finding[] = [
        {
          id: 'TEST-1',
          ruleId: 'HIGH',
          severity: 'high',
          category: 'security',
          file: '/test/file.ts',
          line: 10,
          message: 'High issue',
          code: ''
        }
      ];

      const result = formatSarif(highFinding, mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.runs[0].results[0].level).toBe('error');
    });

    it('should map medium severity to warning', () => {
      const mediumFinding: Finding[] = [
        {
          id: 'TEST-1',
          ruleId: 'MEDIUM',
          severity: 'medium',
          category: 'code-quality',
          file: '/test/file.ts',
          line: 10,
          message: 'Medium issue',
          code: ''
        }
      ];

      const result = formatSarif(mediumFinding, mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.runs[0].results[0].level).toBe('warning');
    });

    it('should map low and info to note', () => {
      const lowFinding: Finding[] = [
        {
          id: 'TEST-1',
          ruleId: 'LOW',
          severity: 'low',
          category: 'best-practices',
          file: '/test/file.ts',
          line: 10,
          message: 'Low issue',
          code: ''
        }
      ];

      const result = formatSarif(lowFinding, mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.runs[0].results[0].level).toBe('note');
    });

    it('should include file location with line number', () => {
      const result = formatSarif(mockFindings, mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.runs[0].results[0].locations[0].physicalLocation.region.startLine).toBe(10);
    });

    it('should include unique rules in driver', () => {
      const result = formatSarif(mockFindings, mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.runs[0].tool.driver.rules).toBeDefined();
      expect(Array.isArray(parsed.runs[0].tool.driver.rules)).toBe(true);
    });

    it('should include original URI base IDs', () => {
      const result = formatSarif(mockFindings, mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.originalUriBaseIds).toBeDefined();
      expect(parsed.originalUriBaseIds.PROJECT_ROOT).toBeDefined();
    });

    it('should handle empty findings', () => {
      const result = formatSarif([], mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.runs[0].results).toHaveLength(0);
      expect(parsed.runs[0].tool.driver.rules).toHaveLength(0);
    });

    it('should include help URI in rules', () => {
      const result = formatSarif(mockFindings, mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.runs[0].tool.driver.rules[0].helpUri).toContain('github.com/attune/attune/rules');
    });
  });
});
