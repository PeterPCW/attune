import { describe, it, expect } from 'vitest';
import { getFrameworkRuleLoaders } from '../rules/framework-rules.js';

describe('FrameworkRuleLoaders', () => {
  describe('getFrameworkRuleLoaders', () => {
    it('should return loaders for all supported frameworks', async () => {
      const loaders = await getFrameworkRuleLoaders();

      // Should have loaders for major frameworks
      expect(loaders).toHaveProperty('react');
      expect(loaders).toHaveProperty('nextjs');
      expect(loaders).toHaveProperty('vue');
      expect(loaders).toHaveProperty('python');
    });

    it('should return callable loaders', async () => {
      const loaders = await getFrameworkRuleLoaders();

      // Each loader should be a function
      expect(typeof loaders.react).toBe('function');
      expect(typeof loaders.nextjs).toBe('function');
      expect(typeof loaders.python).toBe('function');
    });

    it('should load react rules', async () => {
      const loaders = await getFrameworkRuleLoaders();
      const reactRules = await loaders.react();

      expect(reactRules.length).toBeGreaterThan(0);
      // React rules should have id, name, category
      expect(reactRules[0]).toHaveProperty('id');
      expect(reactRules[0]).toHaveProperty('name');
      expect(reactRules[0]).toHaveProperty('category');
    });

    it('should load python rules', async () => {
      const loaders = await getFrameworkRuleLoaders();
      const pythonRules = await loaders.python();

      expect(pythonRules.length).toBeGreaterThan(0);
    });

    it('should include framework in rule frameworks array', async () => {
      const loaders = await getFrameworkRuleLoaders();
      const reactRules = await loaders.react();

      // Each rule should specify react as a target framework
      reactRules.forEach(rule => {
        expect(rule.frameworks).toContain('react');
      });
    });
  });
});
