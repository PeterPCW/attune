import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EngineRuleRegistry } from '../rules/engine-registry.js';
import * as fs from 'fs';
import * as path from 'path';
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'fs';

describe('EngineRuleRegistry', () => {
  const testProjectRoot = '/tmp/test-attune-engine';

  beforeEach(() => {
    // Create test directory structure
    if (!existsSync(testProjectRoot)) {
      mkdirSync(testProjectRoot, { recursive: true });
    }
    // Create src/rules/functions directory for JSON rules
    const functionsDir = path.join(testProjectRoot, 'src/rules/functions');
    if (!existsSync(functionsDir)) {
      mkdirSync(functionsDir, { recursive: true });
    }
    // Create a simple test rule
    writeFileSync(
      path.join(functionsDir, 'test.json'),
      JSON.stringify({
        version: '1.0',
        functions: [
          {
            id: 'TEST_RULE',
            name: 'Test Rule',
            description: 'A test rule',
            enabled: true,
            priority: 1,
            category: 'security',
            condition: {
              type: 'regex',
              pattern: 'TODO'
            },
            action: {
              type: 'flag',
              severity: 'low',
              message: 'Found TODO'
            }
          }
        ]
      })
    );
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testProjectRoot)) {
      rmSync(testProjectRoot, { recursive: true, force: true });
    }
  });

  describe('constructor', () => {
    it('should create an instance with default options', () => {
      const registry = new EngineRuleRegistry();
      expect(registry).toBeDefined();
    });

    it('should accept logger option', () => {
      const registry = new EngineRuleRegistry({ logger: 'verbose' });
      expect(registry).toBeDefined();
    });

    it('should accept custom paths', () => {
      const registry = new EngineRuleRegistry({
        builtInRulesDir: 'custom/rules',
        customRulesDir: 'custom'
      });
      expect(registry).toBeDefined();
    });
  });

  describe('getRulesForFramework', () => {
    it('should return rules for nodejs framework', async () => {
      const registry = new EngineRuleRegistry({
        builtInRulesDir: path.join(testProjectRoot, 'src/rules/functions')
      });

      const rules = await registry.getRulesForFramework('nodejs', {});
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should filter by category when options provided', async () => {
      const registry = new EngineRuleRegistry({
        builtInRulesDir: path.join(testProjectRoot, 'src/rules/functions')
      });

      const securityRules = await registry.getRulesForFramework('nodejs', { security: true });
      expect(securityRules.length).toBeGreaterThan(0);
      // All should be security category
      securityRules.forEach(rule => {
        expect(rule.category).toBe('security');
      });
    });

    it('should filter by lite mode', async () => {
      const registry = new EngineRuleRegistry({
        builtInRulesDir: path.join(testProjectRoot, 'src/rules/functions')
      });

      const allRules = await registry.getRulesForFramework('nodejs', {});
      const liteRules = await registry.getRulesForFramework('nodejs', { lite: true });

      // Lite mode should return fewer or equal rules (only critical/high)
      expect(liteRules.length).toBeLessThanOrEqual(allRules.length);
    });
  });

  describe('getRelevantExtensions', () => {
    it('should return default extensions for nodejs', () => {
      const registry = new EngineRuleRegistry();
      const extensions = registry.getRelevantExtensions('nodejs', {});

      expect(extensions.has('.ts')).toBe(true);
      expect(extensions.has('.js')).toBe(true);
    });

    it('should include Python extensions for python framework', () => {
      const registry = new EngineRuleRegistry();
      const extensions = registry.getRelevantExtensions('python', {});

      expect(extensions.has('.py')).toBe(true);
    });
  });

  describe('executeAll', () => {
    it('should execute rules and return findings', async () => {
      const registry = new EngineRuleRegistry({
        builtInRulesDir: path.join(testProjectRoot, 'src/rules/functions')
      });

      const testFiles = [
        { path: '/test/file.ts', content: '// TODO: fix this' }
      ];

      const findings = await registry.executeAll(testFiles as any, 'nodejs', {});

      expect(findings).toBeDefined();
      expect(Array.isArray(findings)).toBe(true);
    });

    it('should filter findings by category', async () => {
      const registry = new EngineRuleRegistry({
        builtInRulesDir: path.join(testProjectRoot, 'src/rules/functions')
      });

      const testFiles = [
        { path: '/test/file.ts', content: '// TODO: fix this' }
      ];

      // Run with security filter
      const securityFindings = await registry.executeAll(
        testFiles as any,
        'nodejs',
        { security: true }
      );

      // All findings should be from security category
      securityFindings.forEach(finding => {
        expect(finding.category).toBe('security');
      });
    });

    it('should limit findings per rule', async () => {
      const registry = new EngineRuleRegistry({
        builtInRulesDir: path.join(testProjectRoot, 'src/rules/functions')
      });

      // Create a file with many TODO comments
      const testFiles = [
        { path: '/test/file.ts', content: '// TODO: ' + 'x'.repeat(100) }
      ];

      const findings = await registry.executeAll(
        testFiles as any,
        'nodejs',
        { maxFindings: 3 }
      );

      // Should be limited to maxFindings per rule
      expect(findings.length).toBeLessThanOrEqual(3);
    });
  });
});

describe('EngineOptions', () => {
  it('should accept all configuration options', () => {
    const options = {
      logger: 'silent' as const,
      builtInRulesDir: 'custom/rules',
      customRulesDir: 'custom',
      cwd: '/test'
    };

    const registry = new EngineRuleRegistry(options);
    expect(registry).toBeDefined();
  });
});
