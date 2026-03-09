import { describe, it, expect } from 'vitest';
import { AnalysisContext } from '../types/index.js';
import {
  findHardcodedSecret,
  findSensitiveLogging,
  findUrlCredentials,
  findInsecureCookie,
  findDisabledCertValidation,
  findExposedNextjsSecrets,
  findLargeFiles,
  findHighComplexity,
  findOnLines,
  findWithExclusions,
  findImport,
  findDependency,
  findQuery,
  findReactHook,
  findInlineHandler,
  findFrameworkSpecific,
  findMissing,
} from '../rules/helpers/index.js';

const createContext = (framework: string, files: { path: string; content: string }[]): AnalysisContext => ({
  projectRoot: '/test',
  framework: framework as any,
  files: files.map(f => ({ path: f.path, content: f.content })),
  packageJson: null,
  options: {}
});

describe('Helper Functions', () => {
  describe('findHardcodedSecret', () => {
    it('should detect Stripe live keys (24+ chars after sk_live_)', () => {
      // Helper detects actual secret VALUES - needs 24+ chars after sk_live_
      const context = createContext('nodejs', [{
        path: '/test/credentials.js',
        content: `export const key = "sk_live_abcdefghijklmnopqrstuvwxy123456";`
      }]);

      const findings = findHardcodedSecret(context, {
        patterns: ['api[_-]?key'],
        message: 'Hardcoded API key detected',
        skipComments: true,
        checkAssignment: true,
        excludeTypes: true
      });

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].message).toContain('Hardcoded secret detected');
    });

    it('should skip comments when configured', () => {
      const context = createContext('nodejs', [{
        path: '/test/credentials.js',
        content: `// const apiKey = "sk_test_123";`
      }]);

      const findings = findHardcodedSecret(context, {
        patterns: ['api[_-]?key'],
        message: 'Hardcoded API key detected',
        skipComments: true,
        checkAssignment: true,
        excludeTypes: true
      });

      expect(findings.length).toBe(0);
    });
  });

  describe('findSensitiveLogging', () => {
    it('should detect token logging via console.log', () => {
      // Helper detects console.log with token variable reference
      const context = createContext('nodejs', [{
        path: '/test/app.js',
        content: `console.log(user.token);`
      }]);

      const findings = findSensitiveLogging(context, {
        message: 'Sensitive data being logged'
      });

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect secret logging via logger', () => {
      // Helper detects logger with secret variable reference
      const context = createContext('nodejs', [{
        path: '/test/app.js',
        content: `logger.info(user.secret);`
      }]);

      const findings = findSensitiveLogging(context, {
        message: 'Sensitive data being logged'
      });

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('findUrlCredentials', () => {
    it('should detect credentials in URL', () => {
      const context = createContext('nodejs', [{
        path: '/test/app.js',
        content: `const url = "https://user:pass@example.com/api";`
      }]);

      const findings = findUrlCredentials(context, {
        message: 'Credentials in URL'
      });

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('findInsecureCookie', () => {
    it('should detect cookie without secure flags', () => {
      const context = createContext('express', [{
        path: '/test/app.js',
        content: `res.cookie("session", "abc123");`
      }]);

      const findings = findInsecureCookie(context, {
        message: 'Cookie without secure flags'
      });

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should not flag cookie with secure flag', () => {
      const context = createContext('express', [{
        path: '/test/app.js',
        content: `res.cookie("session", "abc123", { secure: true, httpOnly: true });`
      }]);

      const findings = findInsecureCookie(context, {
        message: 'Cookie without secure flags'
      });

      expect(findings.length).toBe(0);
    });
  });

  describe('findDisabledCertValidation', () => {
    it('should detect rejectUnauthorized: false', () => {
      const context = createContext('nodejs', [{
        path: '/test/app.js',
        content: `const https = require("https"); https.request({ rejectUnauthorized: false });`
      }]);

      const findings = findDisabledCertValidation(context, {
        message: 'Certificate validation disabled'
      });

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should detect secure: false', () => {
      const context = createContext('nodejs', [{
        path: '/test/app.js',
        content: `const agent = new https.Agent({ secure: false });`
      }]);

      const findings = findDisabledCertValidation(context, {
        message: 'Certificate validation disabled'
      });

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('findExposedNextjsSecrets', () => {
    it('should detect NEXT_PUBLIC_ on secret variables for Next.js', () => {
      const context = createContext('nextjs', [{
        path: '/test/.env.local',
        content: `NEXT_PUBLIC_STRIPE_SECRET="sk_test_123";`
      }]);

      const findings = findExposedNextjsSecrets(context, {
        message: 'Secret exposed to client'
      });

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should not run for non-Next.js frameworks', () => {
      const context = createContext('react', [{
        path: '/test/.env',
        content: `NEXT_PUBLIC_STRIPE_SECRET="sk_test_123";`
      }]);

      const findings = findExposedNextjsSecrets(context, {
        message: 'Secret exposed to client'
      });

      expect(findings.length).toBe(0);
    });
  });

  describe('findLargeFiles', () => {
    it('should detect files exceeding max lines', () => {
      const context = createContext('nodejs', [{
        path: '/test/large.js',
        content: Array(501).fill('// line').join('\n')
      }]);

      const findings = findLargeFiles(context, {
        maxLines: 500,
        message: 'File too large'
      });

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].message).toContain('501');
    });

    it('should not flag files under max lines', () => {
      const context = createContext('nodejs', [{
        path: '/test/small.js',
        content: Array(100).fill('// line').join('\n')
      }]);

      const findings = findLargeFiles(context, {
        maxLines: 500,
        message: 'File too large'
      });

      expect(findings.length).toBe(0);
    });
  });

  describe('findHighComplexity', () => {
    it('should detect high cyclomatic complexity', () => {
      const context = createContext('nodejs', [{
        path: '/test/complex.js',
        content: `if (a) { if (b) { if (c) { if (d) { x(); } } } }`
      }]);

      const findings = findHighComplexity(context, {
        threshold: 3,
        message: 'High complexity'
      });

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should not flag simple code', () => {
      const context = createContext('nodejs', [{
        path: '/test/simple.js',
        content: `function add(a, b) { return a + b; }`
      }]);

      const findings = findHighComplexity(context, {
        threshold: 10,
        message: 'High complexity'
      });

      expect(findings.length).toBe(0);
    });
  });

  describe('findOnLines', () => {
    it('should find patterns on specific lines', () => {
      const context = createContext('nodejs', [{
        path: '/test/app.js',
        content: `const x = 1;\nconsole.log("test");\nconst y = 2;`
      }]);

      const findings = findOnLines(context, {
        pattern: 'console\\.log',
        message: 'Console log found',
        fileExtensions: ['.js']
      });

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should filter by file extension', () => {
      const context = createContext('nodejs', [
        { path: '/test/app.js', content: 'console.log("test");' },
        { path: '/test/app.ts', content: 'console.log("test");' }
      ]);

      const findings = findOnLines(context, {
        pattern: 'console\\.log',
        message: 'Console log found',
        fileExtensions: ['.js']
      });

      expect(findings.length).toBe(1);
    });

    it('should skip paths when configured', () => {
      const context = createContext('nodejs', [
        { path: '/test/app.js', content: 'console.log("test");' },
        { path: '/test/node_modules/logger.js', content: 'console.log("test");' }
      ]);

      const findings = findOnLines(context, {
        pattern: 'console\\.log',
        message: 'Console log found',
        skipPaths: ['node_modules']
      });

      expect(findings.length).toBe(1);
      expect(findings[0].file).toBe('/test/app.js');
    });
  });

  describe('findWithExclusions', () => {
    it('should find patterns with exclusion zones', () => {
      const context = createContext('nodejs', [{
        path: '/test/app.js',
        content: `const x = query("SELECT * FROM users WHERE id = " + userId);`
      }]);

      const findings = findWithExclusions(context, {
        pattern: 'query\\(',
        message: 'Potential SQL injection',
        excludePatterns: ['// safe'],
        contextRadius: 50
      });

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should exclude matches in exclusion zones', () => {
      const context = createContext('nodejs', [{
        path: '/test/app.js',
        content: `// This is safe: query("SELECT * FROM users")
const x = query("SELECT * FROM users WHERE id = " + userId);`
      }]);

      const findings = findWithExclusions(context, {
        pattern: 'query\\(',
        message: 'Potential SQL injection',
        excludePatterns: ['// .*safe'],
        contextRadius: 50
      });

      // The first match should be excluded
      expect(findings.length).toBeLessThan(2);
    });
  });

  describe('findImport', () => {
    it('should find specific import patterns', () => {
      const context = createContext('nodejs', [{
        path: '/test/app.js',
        content: `import { something } from 'dangerous-package';`
      }]);

      const findings = findImport(context, {
        importPatterns: ['dangerous-package'],
        message: 'Dangerous import'
      });

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('findDependency', () => {
    it('should find specific dependency usage', () => {
      const context = createContext('nodejs', [{
        path: '/test/app.js',
        content: `const _ = require('lodash');`
      }]);

      const findings = findDependency(context, {
        dependencies: ['lodash'],
        message: 'Lodash usage detected'
      });

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('findQuery', () => {
    it('should find database queries', () => {
      const context = createContext('nodejs', [{
        path: '/test/app.js',
        content: `db.query("SELECT * FROM users");`
      }]);

      const findings = findQuery(context, {
        queryTypes: ['query\\('],
        message: 'Database query detected'
      });

      expect(findings.length).toBeGreaterThan(0);
    });
  });

  describe('findReactHook', () => {
    it('should find React hooks in .tsx files', () => {
      const context = createContext('react', [{
        path: '/test/Component.tsx',
        content: `const [state, setState] = useState(0);`
      }]);

      const findings = findReactHook(context, {
        hookName: 'useState',
        message: 'useState hook detected'
      });

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should filter by file extension', () => {
      const context = createContext('react', [
        { path: '/test/Component.tsx', content: 'useState(0);' },
        { path: '/test/data.js', content: 'useState(0);' }
      ]);

      const findings = findReactHook(context, {
        hookName: 'useState',
        message: 'useState hook detected'
      });

      expect(findings.length).toBe(1);
    });
  });

  describe('findInlineHandler', () => {
    it('should find inline event handlers in JSX', () => {
      const context = createContext('react', [{
        path: '/test/Component.tsx',
        content: `<button onClick={handleClick}>Click</button>`
      }]);

      const findings = findInlineHandler(context, {
        message: 'Inline handler detected'
      });

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should filter by framework', () => {
      const context = createContext('vue', [{
        path: '/test/Component.vue',
        content: `<button @click="handleClick">Click</button>`
      }]);

      const findings = findInlineHandler(context, {
        message: 'Inline handler detected',
        frameworks: ['react']
      });

      expect(findings.length).toBe(0);
    });
  });

  describe('findFrameworkSpecific', () => {
    it('should only run for specified frameworks', () => {
      const context = createContext('react', [{
        path: '/test/app.js',
        content: 'console.log("test");'
      }]);

      const findings = findFrameworkSpecific(context, {
        pattern: 'console\\.log',
        message: 'Found',
        frameworks: ['react']
      });

      expect(findings.length).toBeGreaterThan(0);
    });

    it('should not run for non-matching frameworks', () => {
      const context = createContext('vue', [{
        path: '/test/app.js',
        content: 'console.log("test");'
      }]);

      const findings = findFrameworkSpecific(context, {
        pattern: 'console\\.log',
        message: 'Found',
        frameworks: ['react']
      });

      expect(findings.length).toBe(0);
    });
  });

  describe('findMissing', () => {
    it('should detect when pattern is missing', () => {
      const context = createContext('react', [{
        path: '/test/Component.tsx',
        content: 'export default function App() { return <div>Hello</div>; }'
      }]);

      const findings = findMissing(context, {
        pattern: 'ErrorBoundary|getDerivedStateFromError',
        message: 'Missing Error Boundary',
        frameworks: ['react'],
        fileExtensions: ['.tsx', '.ts']
      });

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].message).toBe('Missing Error Boundary');
    });

    it('should not flag when pattern is found', () => {
      const context = createContext('react', [{
        path: '/test/ErrorBoundary.tsx',
        content: 'class ErrorBoundary extends React.Component { componentDidCatch() {} }'
      }]);

      const findings = findMissing(context, {
        pattern: 'ErrorBoundary|getDerivedStateFromError',
        message: 'Missing Error Boundary',
        frameworks: ['react'],
        fileExtensions: ['.tsx', '.ts']
      });

      expect(findings.length).toBe(0);
    });

    it('should respect framework filter', () => {
      const context = createContext('vue', [{
        path: '/test/Component.vue',
        content: '<template><div>Hello</div></template>'
      }]);

      const findings = findMissing(context, {
        pattern: 'ErrorBoundary',
        message: 'Missing Error Boundary',
        frameworks: ['react'],
        fileExtensions: ['.vue']
      });

      expect(findings.length).toBe(0);
    });

    it('should filter by file extension', () => {
      const context = createContext('react', [
        { path: '/test/Component.tsx', content: 'export default function App() { }' },
        { path: '/test/ErrorBoundary.tsx', content: 'class ErrorBoundary { }' }
      ]);

      const findings = findMissing(context, {
        pattern: 'ErrorBoundary',
        message: 'Missing in tsx files',
        fileExtensions: ['.tsx']
      });

      expect(findings.length).toBe(0);
    });
  });
});
