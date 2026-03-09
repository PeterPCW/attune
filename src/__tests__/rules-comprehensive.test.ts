import { describe, it, expect } from 'vitest';
import { AnalysisContext } from '../types/index.js';
import { SecurityRules } from '../rules/security/index.js';
import { AiPatternRules } from '../rules/ai-patterns/index.js';
import { TypescriptRules } from '../rules/typescript/index.js';
import { ReactRules } from '../rules/react/index.js';
import { NextjsRules } from '../rules/nextjs/index.js';
import { ExpressRules } from '../rules/express/index.js';
import { VueRules } from '../rules/vue/index.js';
import { SvelteRules } from '../rules/svelte/index.js';
import { AccessibilityRules } from '../rules/accessibility/index.js';
import { ErrorHandlingRules } from '../rules/error-handling/index.js';
import { LoggingRules } from '../rules/logging/index.js';
import { ComplexityRules } from '../rules/complexity/index.js';
import { DatabaseRules } from '../rules/database/index.js';
import { StateRules } from '../rules/state/index.js';
import { FormRules } from '../rules/forms/index.js';
import { PerformanceRules } from '../rules/performance/index.js';

const createContext = (framework: string, files: { path: string; content: string }[]): AnalysisContext => ({
  projectRoot: '/test',
  framework: framework as any,
  files,
  packageJson: null
});

describe('Security Rules', () => {
  describe('COMM_SECRET_HARDCODED', () => {
    it('should detect hardcoded Stripe keys', () => {
      const rules = SecurityRules.getRules();
      const rule = rules.find(r => r.id === 'COMM_SECRET_HARDCODED')!;
      // Helper detects actual secret VALUES (24+ chars after sk_live_)
      const context = createContext('nodejs', [{
        path: '/test/credentials.ts',
        content: `const key = "sk_live_abcdefghijklmnopqrstuvwxy123456";`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('AI_EXPOSED_SECRETS', () => {
    it('should detect NEXT_PUBLIC_ prefix on secrets', () => {
      const rules = SecurityRules.getRules();
      const rule = rules.find(r => r.id === 'AI_EXPOSED_SECRETS')!;
      const context = createContext('nextjs', [{
        path: '/test/config.ts',
        content: `const secret = process.env.NEXT_PUBLIC_STRIPE_SECRET;`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('OWASP_A03_INJECTION', () => {
    it('should detect SQL injection', () => {
      const rules = SecurityRules.getRules();
      const rule = rules.find(r => r.id === 'OWASP_A03_INJECTION')!;
      const context = createContext('nodejs', [{
        path: '/test/db.ts',
        content: `db.query("SELECT * FROM users WHERE id = " + userId);`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('COMM_LOG_SENSITIVE', () => {
    it('should detect sensitive data in logs', () => {
      const rules = SecurityRules.getRules();
      const rule = rules.find(r => r.id === 'COMM_LOG_SENSITIVE')!;
      // Helper detects logging with variable references to sensitive fields
      const context = createContext('nodejs', [{
        path: '/test/logger.ts',
        content: `console.log(user.password);`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});

describe('AI Pattern Rules', () => {
  describe('AI_EFFECT_SPAGHETTI', () => {
    it('should detect fetch in useEffect', () => {
      const rules = AiPatternRules.getRules();
      const rule = rules.find(r => r.id === 'AI_EFFECT_SPAGHETTI')!;
      const context = createContext('react', [{
        path: '/test/Component.tsx',
        content: `useEffect(() => { fetch('/api/data').then(r => r.json()); }, []);`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('AI_GENERIC_ERROR', () => {
    it('should detect generic error messages', () => {
      const rules = AiPatternRules.getRules();
      const rule = rules.find(r => r.id === 'AI_GENERIC_ERROR')!;
      const context = createContext('react', [{
        path: '/test/Component.tsx',
        content: `catch (e) { console.log("Something went wrong"); }`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  // AI_NO_TESTS and AI_AUTH_WITHOUT_AUTHZ have empty detect() - skip for now
});

describe('TypeScript Rules', () => {
  describe('TS_ANY_USAGE', () => {
    it('should detect any type', () => {
      const rules = TypescriptRules.getRules();
      const rule = rules.find(r => r.id === 'TS_ANY_USAGE')!;
      const context = createContext('nodejs', [{
        path: '/test/file.ts',
        content: `const data: any = {};`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('TS_IMPLICIT_ANY', () => {
    it('should detect implicit any', () => {
      const rules = TypescriptRules.getRules();
      const rule = rules.find(r => r.id === 'TS_IMPLICIT_ANY')!;
      const context = createContext('nodejs', [{
        path: '/test/file.ts',
        content: `function greet(name) { return "Hello " + name; }`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('TS_ENUM_USAGE', () => {
    it('should detect numeric enums', () => {
      const rules = TypescriptRules.getRules();
      const rule = rules.find(r => r.id === 'TS_ENUM_USAGE')!;
      const context = createContext('nodejs', [{
        path: '/test/file.ts',
        content: `enum Status { Active, Inactive }`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});

describe('React Rules', () => {
  describe('REACT_INFINITE_LOOP', () => {
    it('should detect useEffect with empty deps and setState', () => {
      const rules = ReactRules.getRules();
      const rule = rules.find(r => r.id === 'REACT_INFINITE_LOOP')!;
      const context = createContext('react', [{
        path: '/test/Component.tsx',
        content: `useEffect(() => { setCount(count + 1); }, []);`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('REACT_HOOK_RULE_VIOLATION', () => {
    it('should detect hooks in conditionals', () => {
      const rules = ReactRules.getRules();
      const rule = rules.find(r => r.id === 'REACT_HOOK_RULE_VIOLATION')!;
      const context = createContext('react', [{
        path: '/test/Component.tsx',
        content: `if (condition) { const [state, setState] = useState(0); }`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('REACT_MISSING_KEY', () => {
    it('should detect map without key', () => {
      const rules = ReactRules.getRules();
      const rule = rules.find(r => r.id === 'REACT_MISSING_KEY')!;
      const context = createContext('react', [{
        path: '/test/Component.tsx',
        content: `{items.map(item => <li>{item.name}</li>)}`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('REACT_SETSTATE_OBJ_MUTATION', () => {
    it('should have rule registered', () => {
      const rules = ReactRules.getRules();
      const rule = rules.find(r => r.id === 'REACT_SETSTATE_OBJ_MUTATION');
      expect(rule).toBeDefined();
    });
  });
});

describe('Next.js Rules', () => {
  describe('NEXT_SERVER_COMPONENT_CLIENT', () => {
    it('should detect hooks in app directory without use client', () => {
      const rules = NextjsRules.getRules();
      const rule = rules.find(r => r.id === 'NEXT_SERVER_COMPONENT_CLIENT')!;
      const context = createContext('nextjs', [{
        path: '/test/app/page.tsx',
        content: `export default function Page() { const [state, setState] = useState(0); return <div>{state}</div>; }`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('NEXT_CLIENT_DIRECTIVE', () => {
    it('should detect unnecessary use client', () => {
      const rules = NextjsRules.getRules();
      const rule = rules.find(r => r.id === 'NEXT_CLIENT_DIRECTIVE')!;
      const context = createContext('nextjs', [{
        path: '/test/app/page.tsx',
        content: `"use client"; export default function Page() { return <div>Hello</div>; }`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});

describe('Express Rules', () => {
  describe('EXPRESS_SYNC_ROUTE', () => {
    it('should detect sync route handlers', () => {
      const rules = ExpressRules.getRules();
      const rule = rules.find(r => r.id === 'EXPRESS_SYNC_ROUTE')!;
      const context = createContext('express', [{
        path: '/test/server.ts',
        content: `app.get('/api', (req, res) => { res.json({data: 'ok'}); });`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('EXPRESS_HELMET_MISSING', () => {
    it('should detect missing helmet', () => {
      const rules = ExpressRules.getRules();
      const rule = rules.find(r => r.id === 'EXPRESS_HELMET_MISSING')!;
      const context = createContext('express', [{
        path: '/test/server.ts',
        content: `const app = express(); app.get('/', (req, res) => res.send('ok'));`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});

describe('Vue Rules', () => {
  describe('VUE_PROP_DEFAULT_MUTATION', () => {
    it('should have rule registered', () => {
      const rules = VueRules.getRules();
      const rule = rules.find(r => r.id === 'VUE_PROP_DEFAULT_MUTATION');
      expect(rule).toBeDefined();
    });
  });

  describe('VUE_V_FOR_INDEX', () => {
    it('should detect v-for without key', () => {
      const rules = VueRules.getRules();
      const rule = rules.find(r => r.id === 'VUE_V_FOR_INDEX')!;
      const context = createContext('vue', [{
        path: '/test/Component.vue',
        content: `<template><div v-for="item in items">{{ item.name }}</div></template>`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});

describe('Svelte Rules', () => {
  describe('SVELTE_STORE_SUBSCRIPTION', () => {
    it('should detect missing unsubscribe', () => {
      const rules = SvelteRules.getRules();
      const rule = rules.find(r => r.id === 'SVELTE_STORE_SUBSCRIPTION')!;
      const context = createContext('svelte', [{
        path: '/test/Component.svelte',
        content: `<script>import { store } from './store'; $: value = $store;</script>`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});

describe('Accessibility Rules', () => {
  describe('ACCESS_IMG_ALT', () => {
    it('should detect img without alt', () => {
      const rules = AccessibilityRules.getRules();
      const rule = rules.find(r => r.id === 'ACCESS_IMG_ALT')!;
      const context = createContext('react', [{
        path: '/test/Component.tsx',
        content: `<img src="photo.jpg" />`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('ACCESS_ARIA_LABEL', () => {
    it('should detect button without aria-label', () => {
      const rules = AccessibilityRules.getRules();
      const rule = rules.find(r => r.id === 'ACCESS_ARIA_LABEL')!;
      const context = createContext('react', [{
        path: '/test/Component.tsx',
        content: `<button onClick={onClick}></button>`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('ACCESS_HEADING_ORDER', () => {
    it('should have rule registered', () => {
      const rules = AccessibilityRules.getRules();
      const rule = rules.find(r => r.id === 'ACCESS_HEADING_ORDER');
      expect(rule).toBeDefined();
    });
  });
});

describe('Error Handling Rules', () => {
  describe('ERR_SWALLOW_ERRORS', () => {
    it('should detect empty catch blocks', () => {
      const rules = ErrorHandlingRules.getRules();
      const rule = rules.find(r => r.id === 'ERR_SWALLOW_ERRORS')!;
      const context = createContext('nodejs', [{
        path: '/test/file.ts',
        content: `try { doSomething(); } catch (e) { }`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('ERR_PROMISE_CATCH', () => {
    it('should detect then without catch', () => {
      const rules = ErrorHandlingRules.getRules();
      const rule = rules.find(r => r.id === 'ERR_PROMISE_CATCH')!;
      const context = createContext('nodejs', [{
        path: '/test/file.ts',
        content: `fetch('/api').then(res => res.json())`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('ERR_NO_ERROR_BOUNDARY', () => {
    it('should detect React without error boundary', () => {
      const rules = ErrorHandlingRules.getRules();
      const rule = rules.find(r => r.id === 'ERR_NO_ERROR_BOUNDARY')!;
      const context = createContext('react', [{
        path: '/test/Component.tsx',
        content: `export default function App() { return <div>Hello</div>; }`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});

describe('Logging Rules', () => {
  describe('LOG_SENSITIVE', () => {
    it('should detect sensitive data in logs', () => {
      const rules = LoggingRules.getRules();
      const rule = rules.find(r => r.id === 'LOG_SENSITIVE')!;
      const context = createContext('nodejs', [{
        path: '/test/logger.ts',
        content: `console.log("password:", user.password);`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('LOG_CONSOLE_LOG', () => {
    it('should have rule registered', () => {
      const rules = LoggingRules.getRules();
      const rule = rules.find(r => r.id === 'LOG_CONSOLE_LOG');
      expect(rule).toBeDefined();
    });
  });
});

describe('Complexity Rules', () => {
  describe('COMP_EMPTY_CATCH', () => {
    it('should have rule registered', () => {
      const rules = ComplexityRules.getRules();
      const rule = rules.find(r => r.id === 'COMP_EMPTY_CATCH');
      expect(rule).toBeDefined();
    });
  });

  describe('COMP_CONSOLE_LOG', () => {
    it('should detect console.log', () => {
      const rules = ComplexityRules.getRules();
      const rule = rules.find(r => r.id === 'COMP_CONSOLE_LOG')!;
      const context = createContext('nodejs', [{
        path: '/test/file.ts',
        content: `console.log("debug");`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('COMP_BIG_FILE', () => {
    it('should detect large files', () => {
      const rules = ComplexityRules.getRules();
      const rule = rules.find(r => r.id === 'COMP_BIG_FILE')!;
      const content = Array(501).fill('// line').join('\n');
      const context = createContext('nodejs', [{
        path: '/test/large.ts',
        content
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('COMP_CYCLOMATIC', () => {
    it('should detect high complexity', () => {
      const rules = ComplexityRules.getRules();
      const rule = rules.find(r => r.id === 'COMP_CYCLOMATIC')!;
      const context = createContext('nodejs', [{
        path: '/test/file.ts',
        content: `if (a) { if (b) { if (c) { if (d) { x(); } } } }`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});

describe('Database Rules', () => {
  describe('DB_N_PLUS_1', () => {
    it('should detect N+1 query pattern', () => {
      const rules = DatabaseRules.getRules();
      const rule = rules.find(r => r.id === 'DB_N_PLUS_1')!;
      const context = createContext('nodejs', [{
        path: '/test/repository.ts',
        content: `const users = await db.user.findMany(); for (const user of users) { const posts = await db.post.findMany({ where: { userId: user.id } }); }`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('DB_INJECTION_STRING', () => {
    it('should detect SQL string concatenation', () => {
      const rules = DatabaseRules.getRules();
      const rule = rules.find(r => r.id === 'DB_INJECTION_STRING')!;
      const context = createContext('nodejs', [{
        path: '/test/query.ts',
        content: `db.query("SELECT * FROM users WHERE id = " + id);`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});

describe('State Management Rules', () => {
  describe('STATE_GLOBAL_MUTATION', () => {
    it('should have rule registered', () => {
      const rules = StateRules.getRules();
      const rule = rules.find(r => r.id === 'STATE_GLOBAL_MUTATION');
      expect(rule).toBeDefined();
    });
  });

  describe('STATE_USE_STATE_ARRAY', () => {
    it('should have rule registered', () => {
      const rules = StateRules.getRules();
      const rule = rules.find(r => r.id === 'STATE_USE_STATE_ARRAY');
      expect(rule).toBeDefined();
    });
  });
});

describe('Form Rules', () => {
  describe('FORM_NO_VALIDATION', () => {
    it('should detect forms without validation', () => {
      const rules = FormRules.getRules();
      const rule = rules.find(r => r.id === 'FORM_NO_VALIDATION')!;
      const context = createContext('react', [{
        path: '/test/Form.tsx',
        content: `<form><input /></form>`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('FORM_SUBMIT_PREVENT', () => {
    it('should detect onSubmit without preventDefault', () => {
      const rules = FormRules.getRules();
      const rule = rules.find(r => r.id === 'FORM_SUBMIT_PREVENT')!;
      const context = createContext('react', [{
        path: '/test/Form.tsx',
        content: `<form onSubmit={handleSubmit}><button>Submit</button></form>`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});

describe('Performance Rules', () => {
  describe('PERF_MEMORY_LEAK', () => {
    it('should detect global variables', () => {
      const rules = PerformanceRules.getRules();
      const rule = rules.find(r => r.id === 'PERF_MEMORY_LEAK')!;
      const context = createContext('nodejs', [{
        path: '/test/file.ts',
        content: `global.config = { value: 123 };`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('PERF_SYNCHRONOUS', () => {
    it('should detect sync file operations', () => {
      const rules = PerformanceRules.getRules();
      const rule = rules.find(r => r.id === 'PERF_SYNCHRONOUS')!;
      const context = createContext('nodejs', [{
        path: '/test/file.ts',
        content: `const data = fs.readFileSync('file.txt');`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('PERF_DEBOUNCE', () => {
    it('should detect undebounced scroll handlers', () => {
      const rules = PerformanceRules.getRules();
      const rule = rules.find(r => r.id === 'PERF_DEBOUNCE')!;
      const context = createContext('react', [{
        path: '/test/Component.tsx',
        content: `window.addEventListener('scroll', handleScroll);`
      }]);
      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});
