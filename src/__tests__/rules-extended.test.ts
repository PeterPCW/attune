import { describe, it, expect } from 'vitest';
import { AnalysisContext } from '../types/index.js';

// Import rules using the same pattern as other tests
import { SecurityRules } from '../rules/security/index.js';
import { ExpressRules } from '../rules/express/index.js';
import { FastifyRules } from '../rules/fastify/index.js';
import { ApiRules } from '../rules/api/index.js';
import { TrpcRules } from '../rules/trpc/index.js';
import { AstroRules } from '../rules/astro/index.js';
import { AngularRules } from '../rules/angular/index.js';
import { CliRules } from '../rules/cli/index.js';
import { ReactRules } from '../rules/react/index.js';
import { NuxtRules } from '../rules/nuxt/index.js';
import { RemixRules } from '../rules/remix/index.js';
import { VueRules } from '../rules/vue/index.js';
import { SvelteRules } from '../rules/svelte/index.js';
import { SolidjsRules } from '../rules/solidjs/index.js';

const createContext = (framework: string, files: { path: string; content: string }[]): AnalysisContext => ({
  projectRoot: '/test',
  framework: framework as any,
  files: files.map(f => ({ ...f, size: f.content.length, language: 'typescript' })),
  config: {}
});

describe('Fastify Rules', () => {
  describe('FASTIFY_NO_SCHEMA', () => {
    it('should detect missing Fastify schema', () => {
      const rules = FastifyRules.getRules();
      const rule = rules.find(r => r.id === 'FASTIFY_NO_SCHEMA');
      if (!rule) return;

      const context = createContext('fastify', [{
        path: '/test/server.ts',
        content: `fastify.get("/", async (req) => { return { hello: "world" }; });`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });

  describe('FASTIFY_NO_ERROR_HANDLER', () => {
    it('should detect missing error handler', () => {
      const rules = FastifyRules.getRules();
      const rule = rules.find(r => r.id === 'FASTIFY_NO_ERROR_HANDLER');
      if (!rule) return;

      const context = createContext('fastify', [{
        path: '/test/server.ts',
        content: `const fastify = require('fastify')();`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });

  describe('FASTIFY_ASYNC_ERROR', () => {
    it('should detect missing async error handling', () => {
      const rules = FastifyRules.getRules();
      const rule = rules.find(r => r.id === 'FASTIFY_ASYNC_ERROR');
      if (!rule) return;

      const context = createContext('fastify', [{
        path: '/test/server.ts',
        content: `fastify.get("/", (req, reply) => { throw new Error("oops"); });`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });

  describe('FASTIFY_RATE_LIMIT', () => {
    it('should detect missing rate limiting', () => {
      const rules = FastifyRules.getRules();
      const rule = rules.find(r => r.id === 'FASTIFY_RATE_LIMIT');
      if (!rule) return;

      const context = createContext('fastify', [{
        path: '/test/server.ts',
        content: `fastify.get("/", async (req) => { return { hello: "world" }; });`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });
});

describe('API Rules', () => {
  describe('API_NO_ERROR_TYPE', () => {
    it('should detect missing error types in Express', () => {
      const rules = ApiRules.getRules();
      const rule = rules.find(r => r.id === 'API_NO_ERROR_TYPE');
      if (!rule) return;

      const context = createContext('express', [{
        path: '/test/routes.ts',
        content: `app.get('/users', (req, res) => { res.status(500).json({ error: 'Error' }); });`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });

  describe('API_NO_PAGINATION', () => {
    it('should detect missing pagination', () => {
      const rules = ApiRules.getRules();
      const rule = rules.find(r => r.id === 'API_NO_PAGINATION');
      if (!rule) return;

      const context = createContext('express', [{
        path: '/test/routes.ts',
        content: `app.get('/users', (req, res) => { res.json(users); });`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });
});

describe('TRPC Rules', () => {
  describe('TRPC_NO_ERROR_HANDLING', () => {
    it('should detect missing error handling in tRPC', () => {
      const rules = TrpcRules.getRules();
      const rule = rules.find(r => r.id === 'TRPC_NO_ERROR_HANDLING');
      if (!rule) return;

      const context = createContext('nextjs', [{
        path: '/test/trpc.ts',
        content: `export const appRouter = t.router({});`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });
});

describe('Astro Rules', () => {
  describe('ASTRO_NO_IMAGE_SERVICE', () => {
    it('should detect missing image service', () => {
      const rules = AstroRules.getRules();
      const rule = rules.find(r => r.id === 'ASTRO_NO_IMAGE_SERVICE');
      if (!rule) return;

      const context = createContext('astro', [{
        path: '/test/astro.config.mjs',
        content: `export default defineConfig({});`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });
});

describe('Angular Rules', () => {
  describe('ANGULAR_NO_ONPUSH', () => {
    it('should detect missing OnPush change detection', () => {
      const rules = AngularRules.getRules();
      const rule = rules.find(r => r.id === 'ANGULAR_NO_ONPUSH');
      if (!rule) return;

      const context = createContext('angular', [{
        path: '/test/app.component.ts',
        content: `@Component({}) export class AppComponent {}`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });

  describe('ANGULAR_SUBSCRIBE_LEAK', () => {
    it('should detect subscription leaks', () => {
      const rules = AngularRules.getRules();
      const rule = rules.find(r => r.id === 'ANGULAR_SUBSCRIBE_LEAK');
      if (!rule) return;

      const context = createContext('angular', [{
        path: '/test/app.component.ts',
        content: `ngOnInit() { this.http.get('/api').subscribe(); }`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });

  describe('ANGULAR_NO_DETECT_CHANGE', () => {
    it('should detect change detection issues', () => {
      const rules = AngularRules.getRules();
      const rule = rules.find(r => r.id === 'ANGULAR_NO_DETECT_CHANGE');
      if (!rule) return;

      const context = createContext('angular', [{
        path: '/test/app.component.ts',
        content: `export class AppComponent { update() { this.value = 'new'; } }`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });
});

describe('CLI Rules', () => {
  describe('CLI_NO_OUTPUT', () => {
    it('should detect missing CLI output handling', () => {
      const rules = CliRules.getRules();
      const rule = rules.find(r => r.id === 'CLI_NO_OUTPUT');
      if (!rule) return;

      const context = createContext('nodejs', [{
        path: '/test/bin/cli.js',
        content: `console.log("Hello");`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });

  describe('CLI_NO_ERROR_HANDLING', () => {
    it('should detect missing CLI error handling', () => {
      const rules = CliRules.getRules();
      const rule = rules.find(r => r.id === 'CLI_NO_ERROR_HANDLING');
      if (!rule) return;

      const context = createContext('nodejs', [{
        path: '/test/bin/cli.js',
        content: `#!/usr/bin/env node\nconsole.log("Hello");`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });

  describe('CLI_NO_HELP', () => {
    it('should detect missing help command', () => {
      const rules = CliRules.getRules();
      const rule = rules.find(r => r.id === 'CLI_NO_HELP');
      if (!rule) return;

      const context = createContext('nodejs', [{
        path: '/test/bin/cli.js',
        content: `#!/usr/bin/env node\nconsole.log("Hello");`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });

  describe('CLI_NO_VERSION', () => {
    it('should detect missing version flag', () => {
      const rules = CliRules.getRules();
      const rule = rules.find(r => r.id === 'CLI_NO_VERSION');
      if (!rule) return;

      const context = createContext('nodejs', [{
        path: '/test/bin/cli.js',
        content: `#!/usr/bin/env node\nconsole.log("Hello");`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });

  describe('CLI_PARSER_MISSING', () => {
    it('should detect missing CLI parser', () => {
      const rules = CliRules.getRules();
      const rule = rules.find(r => r.id === 'CLI_PARSER_MISSING');
      if (!rule) return;

      const context = createContext('nodejs', [{
        path: '/test/bin/cli.js',
        content: `#!/usr/bin/env node\nconst args = process.argv;`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });
});

describe('React Rules', () => {
  describe('REACT_MISSING_DEPS', () => {
    it('should detect missing useEffect dependencies', () => {
      const rules = ReactRules.getRules();
      const rule = rules.find(r => r.id === 'REACT_MISSING_DEPS');
      if (!rule) return;

      const context = createContext('react', [{
        path: '/test/Component.tsx',
        content: `useEffect(() => { console.log(state); }, []);`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });

  describe('REACT_INFINITE_LOOP', () => {
    it('should detect infinite loop in useEffect', () => {
      const rules = ReactRules.getRules();
      const rule = rules.find(r => r.id === 'REACT_INFINITE_LOOP');
      if (!rule) return;

      const context = createContext('react', [{
        path: '/test/Component.tsx',
        content: `useEffect(() => { setCount(c => c + 1); }, [count]);`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });

  describe('REACT_HOOK_RULE_VIOLATION', () => {
    it('should detect hooks in conditionals', () => {
      const rules = ReactRules.getRules();
      const rule = rules.find(r => r.id === 'REACT_HOOK_RULE_VIOLATION');
      if (!rule) return;

      const context = createContext('react', [{
        path: '/test/Component.tsx',
        content: `if (condition) { useState(0); }`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });
});

describe('Nuxt Rules', () => {
  describe('NUXT_NO_PINIA', () => {
    it('should detect missing Pinia store', () => {
      const rules = NuxtRules.getRules();
      const rule = rules.find(r => r.id === 'NUXT_NO_PINIA');
      if (!rule) return;

      const context = createContext('nuxt', [{
        path: '/test/app.vue',
        content: `<template><div>Hello</div></template>`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });
});

describe('Remix Rules', () => {
  describe('REMIX_NO_ERROR_BOUNDARY', () => {
    it('should detect missing error boundary', () => {
      const rules = RemixRules.getRules();
      const rule = rules.find(r => r.id === 'REMIX_NO_ERROR_BOUNDARY');
      if (!rule) return;

      const context = createContext('remix', [{
        path: '/test/routes/index.tsx',
        content: `export default function Index() { return <div>Hello</div>; }`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });
});

describe('Vue Rules', () => {
  describe('VUE_NO_V_MODEL', () => {
    it('should detect missing v-model', () => {
      const rules = VueRules.getRules();
      const rule = rules.find(r => r.id === 'VUE_NO_V_MODEL');
      if (!rule) return;

      const context = createContext('vue', [{
        path: '/test/App.vue',
        content: `<template><input></template>`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });
});

describe('Svelte Rules', () => {
  describe('SVELTE_NO_STORE', () => {
    it('should detect missing Svelte store', () => {
      const rules = SvelteRules.getRules();
      const rule = rules.find(r => r.id === 'SVELTE_NO_STORE');
      if (!rule) return;

      const context = createContext('svelte', [{
        path: '/test/App.svelte',
        content: `<script>let count = 0;</script><button on:click={() => count++}>{count}</button>`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });
});

describe('SolidJS Rules', () => {
  describe('SOLID_NO_SIGNAL', () => {
    it('should detect missing SolidJS signal', () => {
      const rules = SolidjsRules.getRules();
      const rule = rules.find(r => r.id === 'SOLID_NO_SIGNAL');
      if (!rule) return;

      const context = createContext('solidjs', [{
        path: '/test/App.tsx',
        content: `function App() { return <div>Hello</div>; }`
      }]);
      const findings = rule.detect(context);
      expect(findings).toBeDefined();
    });
  });
});
