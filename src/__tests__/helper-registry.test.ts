import { describe, it, expect } from 'vitest';
import { DefaultHelperRegistry, IHelperRegistry } from '../rules/helpers/registry.js';
import { Finding } from '../types/index.js';

describe('IHelperRegistry', () => {
  describe('DefaultHelperRegistry', () => {
    const mockHelper = (context: any, params: any): Finding[] => {
      return [];
    };

    const helpers: Record<string, any> = {
      'test-helper': mockHelper,
      'another-helper': mockHelper
    };

    let registry: IHelperRegistry;

    beforeEach(() => {
      registry = new DefaultHelperRegistry(helpers);
    });

    it('should create instance with helpers', () => {
      expect(registry).toBeDefined();
    });

    it('should get a helper by name', () => {
      const helper = registry.get('test-helper');
      expect(helper).toBeDefined();
      expect(typeof helper).toBe('function');
    });

    it('should return undefined for non-existent helper', () => {
      const helper = registry.get('non-existent');
      expect(helper).toBeUndefined();
    });

    it('should check if helper exists', () => {
      expect(registry.has('test-helper')).toBe(true);
      expect(registry.has('non-existent')).toBe(false);
    });

    it('should get all helper keys', () => {
      const keys = registry.keys();
      expect(keys).toContain('test-helper');
      expect(keys).toContain('another-helper');
    });
  });
});

describe('Custom Helper Registry', () => {
  it('should allow custom helper implementation', () => {
    const customRegistry: IHelperRegistry = {
      get: (name: string) => {
        if (name === 'custom') {
          return (context: any, params: any) => [{ id: 'test', severity: 'low' } as Finding];
        }
        return undefined;
      },
      has: (name: string) => name === 'custom',
      keys: () => ['custom']
    };

    expect(customRegistry.has('custom')).toBe(true);
    expect(customRegistry.has('other')).toBe(false);
    expect(customRegistry.keys()).toEqual(['custom']);
  });
});
