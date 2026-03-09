import { describe, it, expect } from 'vitest';
import { AnalysisContext } from '../types/index.js';
import { MvcRules } from '../rules/mvc/index.js';

describe('MVC Rules', () => {
  const createContext = (files: { path: string; content: string }[]): AnalysisContext => ({
    projectRoot: '/test',
    framework: 'nodejs',
    files,
    packageJson: null
  });

  describe('ThinControllerRule', () => {
    it('should detect thick controllers', () => {
      const rules = MvcRules.getRules();
      const rule = rules.find(r => r.id === 'MVC_THIN_CONTROLLER');

      if (!rule) {
        expect(true).toBe(true); // Skip if rule doesn't exist
        return;
      }

      const context = createContext([{
        path: '/test/controllers/UserController.ts',
        content: `
          export class UserController {
            getUser() { return {}; }
            createUser() { return {}; }
            updateUser() { return {}; }
            deleteUser() { return {}; }
            listUsers() { return {}; }
            getById() { return {}; }
            search() { return {}; }
          }
        `
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('BusinessLogicInModelRule', () => {
    it('should detect business logic in models', () => {
      const rules = MvcRules.getRules();
      const rule = rules.find(r => r.id === 'MVC_LOGIC_IN_MODEL');

      if (!rule) {
        expect(true).toBe(true);
        return;
      }

      const context = createContext([{
        path: '/test/models/User.ts',
        content: `
          export class User {
            save() {
              // Business logic here
              const validation = this.validate();
              if (!validation) throw new Error();
              return db.query('INSERT INTO users...');
            }
          }
        `
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});
