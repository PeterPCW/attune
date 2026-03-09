import { describe, it, expect } from 'vitest';
import { AnalysisContext } from '../types/index.js';
import { SecretsScanner } from '../rules/security/secrets.js';
import { OwaspScanner } from '../rules/security/owasp.js';
import { AiPatternRules } from '../rules/ai-patterns/index.js';
import { TypescriptRules } from '../rules/typescript/index.js';
import { ReactRules } from '../rules/react/index.js';

describe('Security Rules', () => {
  const createContext = (files: { path: string; content: string }[]): AnalysisContext => ({
    projectRoot: '/test',
    framework: 'nodejs',
    files,
    packageJson: null
  });

  describe('HardcodedSecretsRule', () => {
    it('should detect hardcoded API keys', () => {
      const rules = SecretsScanner.getRules();
      const rule = rules.find(r => r.id === 'COMM_SECRET_HARDCODED')!;

      const context = createContext([{
        path: '/test/config.ts',
        content: `const apiKey = "sk-1234567890abcdef";`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });

    it('should not flag commented secrets', () => {
      const rules = SecretsScanner.getRules();
      const rule = rules.find(r => r.id === 'COMM_SECRET_HARDCODED')!;

      const context = createContext([{
        path: '/test/config.ts',
        content: `// TODO: add apiKey = "sk-1234567890abcdef";`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBe(0);
    });
  });

  describe('SqlInjectionRule', () => {
    it('should detect SQL string concatenation', () => {
      const rules = OwaspScanner.getRules();
      const rule = rules.find(r => r.id === 'OWASP_A03_INJECTION')!;

      const context = createContext([{
        path: '/test/db.ts',
        content: `const result = db.query("SELECT * FROM users WHERE id = " + userId);`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });

    it('should not flag parameterized queries', () => {
      const rules = OwaspScanner.getRules();
      const rule = rules.find(r => r.id === 'OWASP_A03_INJECTION')!;

      const context = createContext([{
        path: '/test/db.ts',
        content: `const result = db.query("SELECT * FROM users WHERE id = $1", [userId]);`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBe(0);
    });
  });

  describe('CommandInjectionRule', () => {
    it('should detect exec with string concatenation', () => {
      const rules = OwaspScanner.getRules();
      const rule = rules.find(r => r.id === 'OWASP_A03_INJECTION_CMD')!;

      const context = createContext([{
        path: '/test/cmd.ts',
        content: `exec("ls " + userInput);`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});

describe('AI Pattern Rules', () => {
  const createReactContext = (files: { path: string; content: string }[]): AnalysisContext => ({
    projectRoot: '/test',
    framework: 'react',
    files,
    packageJson: null
  });

  describe('EffectSpaghettiRule', () => {
    it('should detect fetch in useEffect', () => {
      const rules = AiPatternRules.getRules();
      const rule = rules.find(r => r.id === 'AI_EFFECT_SPAGHETTI')!;

      const context = createReactContext([{
        path: '/test/Component.tsx',
        content: `useEffect(() => { fetch('/api/data').then(r => r.json()); }, []);`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('GenericErrorRule', () => {
    it('should detect generic error messages', () => {
      const rules = AiPatternRules.getRules();
      const rule = rules.find(r => r.id === 'AI_GENERIC_ERROR')!;

      const context = createReactContext([{
        path: '/test/Component.tsx',
        content: `catch (e) { console.log("Something went wrong"); }`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});

describe('TypeScript Rules', () => {
  const createContext = (files: { path: string; content: string }[]): AnalysisContext => ({
    projectRoot: '/test',
    framework: 'nodejs',
    files,
    packageJson: null
  });

  describe('AnyUsageRule', () => {
    it('should detect any type usage', () => {
      const rules = TypescriptRules.getRules();
      const rule = rules.find(r => r.id === 'TS_ANY_USAGE')!;

      const context = createContext([{
        path: '/test/file.ts',
        content: `const data: any = {};`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('ImplicitAnyRule', () => {
    it('should detect implicit any in function params', () => {
      const rules = TypescriptRules.getRules();
      const rule = rules.find(r => r.id === 'TS_IMPLICIT_ANY')!;

      const context = createContext([{
        path: '/test/file.ts',
        content: `function greet(name) { return "Hello " + name; }`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});

describe('React Rules', () => {
  const createReactContext = (files: { path: string; content: string }[]): AnalysisContext => ({
    projectRoot: '/test',
    framework: 'react',
    files,
    packageJson: null
  });

  describe('InfiniteLoopRule', () => {
    it('should detect infinite loop pattern', () => {
      const rules = ReactRules.getRules();
      const rule = rules.find(r => r.id === 'REACT_INFINITE_LOOP')!;

      const context = createReactContext([{
        path: '/test/Component.tsx',
        content: `useEffect(() => { setCount(count + 1); }, []);`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('MissingKeyRule', () => {
    it('should detect map without key', () => {
      const rules = ReactRules.getRules();
      const rule = rules.find(r => r.id === 'REACT_MISSING_KEY')!;

      const context = createReactContext([{
        path: '/test/Component.tsx',
        content: `{items.map(item => <li>{item.name}</li>)}`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});
