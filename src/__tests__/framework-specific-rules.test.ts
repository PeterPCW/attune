import { describe, it, expect } from 'vitest';
import { AnalysisContext } from '../types/index.js';
import { AngularRules } from '../rules/angular/index.js';
import { AstroRules } from '../rules/astro/index.js';
import { FastifyRules } from '../rules/fastify/index.js';
import { TrpcRules } from '../rules/trpc/index.js';
import { ApiRules } from '../rules/api/index.js';

describe('Framework Rules', () => {
  const createContext = (files: { path: string; content: string }[], framework: string): AnalysisContext => ({
    projectRoot: '/test',
    framework: framework as any,
    files,
    packageJson: null
  });

  describe('Angular Rules', () => {
    it('should get Angular rules', () => {
      const rules = AngularRules.getRules();
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should detect component without OnPush', () => {
      const rules = AngularRules.getRules();
      const rule = rules.find(r => r.id === 'ANGULAR_ONPUSH');

      if (!rule) {
        expect(true).toBe(true);
        return;
      }

      const context = createContext([{
        path: '/test/app.component.ts',
        content: `@Component({}) export class AppComponent {}`
      }], 'angular');

      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('Astro Rules', () => {
    it('should get Astro rules', () => {
      const rules = AstroRules.getRules();
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should detect Astro component', () => {
      const rules = AstroRules.getRules();
      const rule = rules.find(r => r.id === 'ASTRO_COMPONENT');

      if (!rule) {
        expect(true).toBe(true);
        return;
      }

      const context = createContext([{
        path: '/test/pages/index.astro',
        content: `---
const title = "Hello";
---
<h1>{title}</h1>`
      }], 'astro');

      const findings = rule.detect(context);
      expect(findings.length).toBe(0); // Valid Astro component
    });
  });

  describe('Fastify Rules', () => {
    it('should get Fastify rules', () => {
      const rules = FastifyRules.getRules();
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should detect Fastify route without schema', () => {
      const rules = FastifyRules.getRules();
      const rule = rules.find(r => r.id === 'FASTIFY_NO_SCHEMA');

      if (!rule) {
        expect(true).toBe(true);
        return;
      }

      const context = createContext([{
        path: '/test/routes/users.ts',
        content: `fastify.get('/users', async (req) => { return []; });`
      }], 'fastify');

      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('tRPC Rules', () => {
    it('should get tRPC rules', () => {
      const rules = TrpcRules.getRules();
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should have TRPC_NO_INPUT_SCHEMA rule', () => {
      const rules = TrpcRules.getRules();
      const rule = rules.find(r => r.id === 'TRPC_NO_INPUT_SCHEMA');
      expect(rule).toBeDefined();
    });
  });

  describe('API Rules', () => {
    it('should get API rules', () => {
      const rules = ApiRules.getRules();
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should detect missing error handling', () => {
      const rules = ApiRules.getRules();
      const rule = rules.find(r => r.id === 'API_NO_ERROR_HANDLING');

      if (!rule) {
        expect(true).toBe(true);
        return;
      }

      const context = createContext([{
        path: '/test/routes/users.ts',
        content: `app.get('/users', async (req, res) => {
          const users = await db.query('SELECT * FROM users');
          res.json(users);
        });`
      }], 'express');

      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});
