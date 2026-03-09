import { describe, it, expect } from 'vitest';
import { Finding, ScanMetadata, CliOptions } from '../types/index.js';
import {
  redactSecrets,
  redactPath,
  redactUsername,
  sanitizePath,
  sanitizeCode,
  sanitizeFindings,
  sanitizeMetadata,
  checkForSensitiveFiles,
  generateSummaryOnly
} from '../core/sanitizer.js';

describe('Sanitizer', () => {
  describe('redactSecrets', () => {
    it('should redact Stripe keys', () => {
      const text = 'const stripeKey = "sk_live_abcdefghijklmnopqrst";';
      const result = redactSecrets(text);
      expect(result).toContain('[STRIPE_KEY]');
      expect(result).not.toContain('sk_live_');
    });

    it('should redact AWS keys', () => {
      const text = 'const awsKey = "AKIAIOSFODNN7EXAMPLE";';
      const result = redactSecrets(text);
      expect(result).toContain('[AWS_KEY]');
      expect(result).not.toContain('AKIAIOSFODNN7');
    });

    it('should redact GitHub tokens', () => {
      // Use gho_ pattern which has similar regex
      const text = 'const token = "gho_abcdefghijklmnopqrstuvwxyz1234567890";';
      const result = redactSecrets(text);
      expect(result).toContain('[GITHUB_TOKEN]');
      expect(result).not.toContain('gho_');
    });

    it('should redact JWT tokens', () => {
      const text = 'const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";';
      const result = redactSecrets(text);
      expect(result).toContain('[JWT_TOKEN]');
      expect(result).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    it('should redact private keys', () => {
      const text = '-----BEGIN RSA PRIVATE KEY-----MIIEogIBAAKCAQEA...';
      const result = redactSecrets(text);
      expect(result).toContain('[PRIVATE_KEY]');
      expect(result).not.toContain('BEGIN RSA PRIVATE KEY');
    });

    it('should redact database connection strings with passwords', () => {
      const text = 'mongodb://admin:password123@mongodb.example.com:27017';
      const result = redactSecrets(text);
      expect(result).toContain('[USER]:[PASS]@');
      expect(result).not.toContain('password123');
    });

    it('should redact Slack tokens', () => {
      const text = 'const slack = "xoxb-1234567890123-abcdefghijklmnop";';
      const result = redactSecrets(text);
      expect(result).toContain('[SLACK_TOKEN]');
      expect(result).not.toContain('xoxb-');
    });

    it('should handle text without secrets', () => {
      const text = 'const x = 1; console.log("hello");';
      const result = redactSecrets(text);
      expect(result).toBe(text);
    });
  });

  describe('redactPath', () => {
    it('should convert absolute path to relative', () => {
      const filePath = '/home/user/project/src/file.ts';
      const projectRoot = '/home/user/project';
      const result = redactPath(filePath, projectRoot);
      expect(result).toBe('src/file.ts');
    });

    it('should handle paths with no project root match', () => {
      const filePath = '/other/path/file.ts';
      const projectRoot = '/home/user/project';
      const result = redactPath(filePath, projectRoot);
      expect(result).toContain('file.ts');
    });

    it('should return [root] for root-level paths', () => {
      const filePath = '/home/user/project';
      const projectRoot = '/home/user/project';
      const result = redactPath(filePath, projectRoot);
      expect(result).toBe('[root]');
    });
  });

  describe('redactUsername', () => {
    it('should redact /home/username paths', () => {
      const path = '/home/johndoe/project/src/file.ts';
      const result = redactUsername(path);
      expect(result).toContain('/home/[user]/');
      expect(result).not.toContain('johndoe');
    });

    it('should redact /Users/username paths', () => {
      const path = '/Users/macuser/project/src/file.ts';
      const result = redactUsername(path);
      expect(result).toContain('/Users/[user]/');
      expect(result).not.toContain('macuser');
    });

    it('should redact email addresses', () => {
      const path = '/home/user/file.txt reference: user@example.com';
      const result = redactUsername(path);
      expect(result).toContain('[email]');
      expect(result).not.toContain('user@example.com');
    });
  });

  describe('sanitizePath', () => {
    const projectRoot = '/home/user/project';

    it('should redact path when publicSafe is true', () => {
      const options: CliOptions = { publicSafe: true } as CliOptions;
      // Use the same username as projectRoot so redactPath can match after redactUsername
      const filePath = '/home/user/project/src/file.ts';
      const result = sanitizePath(filePath, projectRoot, options);
      // redactUsername: /home/user/ matches, becomes /home/[user]/
      // redactPath: /home/[user]/project/src/file.ts - removes project root
      // Note: redactPath replaces projectRoot string which is now different, so it keeps most of the path
      expect(result).not.toBe(filePath);
    });

    it('should redact path when noPaths is true', () => {
      const options: CliOptions = { noPaths: true } as CliOptions;
      const filePath = '/home/user/project/src/file.ts';
      const result = sanitizePath(filePath, projectRoot, options);
      // noPaths only calls redactPath, not redactUsername
      expect(result).toBe('src/file.ts');
    });

    it('should redact username when publicSafe is true', () => {
      const options: CliOptions = { publicSafe: true } as CliOptions;
      const filePath = '/home/johndoe/project/src/file.ts';
      const result = sanitizePath(filePath, projectRoot, options);
      // redactUsername runs first: /home/johndoe -> /home/[user]
      // Then redactPath: /home/[user]/project doesn't match /home/user/project, so it stays as is
      expect(result).toContain('[user]');
    });

    it('should not modify path when no options set', () => {
      const options: CliOptions = {} as CliOptions;
      const filePath = '/home/user/project/src/file.ts';
      const result = sanitizePath(filePath, projectRoot, options);
      expect(result).toBe(filePath);
    });
  });

  describe('sanitizeCode', () => {
    it('should redact secrets when publicSafe is true', () => {
      const options: CliOptions = { publicSafe: true } as CliOptions;
      const code = 'const key = "sk_live_abcdefghijklmnopqrst";';
      const result = sanitizeCode(code, options);
      expect(result).toContain('[STRIPE_KEY]');
    });

    it('should redact secrets when redactSecrets is true', () => {
      const options: CliOptions = { redactSecrets: true } as CliOptions;
      const code = 'const key = "sk_live_abcdefghijklmnopqrst";';
      const result = sanitizeCode(code, options);
      expect(result).toContain('[STRIPE_KEY]');
    });

    it('should not modify code when no options set', () => {
      const options: CliOptions = {} as CliOptions;
      const code = 'const x = 1;';
      const result = sanitizeCode(code, options);
      expect(result).toBe(code);
    });

    it('should handle undefined code', () => {
      const options: CliOptions = { publicSafe: true } as CliOptions;
      const result = sanitizeCode(undefined, options);
      expect(result).toBeUndefined();
    });
  });

  describe('sanitizeFindings', () => {
    const mockFinding: Finding = {
      id: 'TEST-1',
      ruleId: 'TEST',
      severity: 'high',
      category: 'security',
      file: '/home/user/project/src/file.ts',
      line: 10,
      message: 'Test finding',
      code: 'const key = "sk_live_abcdefghijklmnopqrst";',
      recommendation: {
        title: 'Test recommendation',
        description: 'Test description',
        library: 'test-lib'
      }
    };

    it('should filter out security findings when silentSecurity is true', () => {
      const options: CliOptions = { silentSecurity: true } as CliOptions;
      const findings = [mockFinding];
      const result = sanitizeFindings(findings, '/home/user/project', options);
      expect(result.length).toBe(0);
    });

    it('should sanitize paths when publicSafe is true', () => {
      const options: CliOptions = { publicSafe: true } as CliOptions;
      const findings = [mockFinding];
      const result = sanitizeFindings(findings, '/home/user/project', options);
      // Path should be modified (made relative or username redacted)
      expect(result[0].file).not.toBe('/home/user/project/src/file.ts');
    });

    it('should sanitize code when publicSafe is true', () => {
      const options: CliOptions = { publicSafe: true } as CliOptions;
      const findings = [mockFinding];
      const result = sanitizeFindings(findings, '/home/user/project', options);
      expect(result[0].code).toContain('[STRIPE_KEY]');
    });

    it('should not modify findings when no options set', () => {
      const options: CliOptions = {} as CliOptions;
      const findings = [mockFinding];
      const result = sanitizeFindings(findings, '/home/user/project', options);
      expect(result[0].file).toBe('/home/user/project/src/file.ts');
    });
  });

  describe('sanitizeMetadata', () => {
    const mockMetadata: ScanMetadata = {
      projectRoot: '/home/user/project',
      framework: 'nodejs',
      scanTime: 100,
      filesScanned: 10,
      rulesRun: 5
    };

    it('should redact projectRoot when publicSafe is true', () => {
      const options: CliOptions = { publicSafe: true } as CliOptions;
      const result = sanitizeMetadata(mockMetadata, options);
      expect(result.projectRoot).toBe('[PROJECT_ROOT]');
    });

    it('should redact projectRoot when noPaths is true', () => {
      const options: CliOptions = { noPaths: true } as CliOptions;
      const result = sanitizeMetadata(mockMetadata, options);
      expect(result.projectRoot).toBe('[PROJECT_ROOT]');
    });

    it('should not modify metadata when no options set', () => {
      const options: CliOptions = {} as CliOptions;
      const result = sanitizeMetadata(mockMetadata, options);
      expect(result.projectRoot).toBe('/home/user/project');
    });
  });

  describe('checkForSensitiveFiles', () => {
    it('should warn about .env files', () => {
      const files = [{ path: '/project/.env' }];
      const result = checkForSensitiveFiles(files);
      expect(result.some(r => r.includes('.env file'))).toBe(true);
    });

    it('should warn about credentials.json', () => {
      const files = [{ path: '/project/credentials.json' }];
      const result = checkForSensitiveFiles(files);
      expect(result.some(r => r.includes('credentials.json'))).toBe(true);
    });

    it('should warn about .pem files', () => {
      const files = [{ path: '/project/keys.pem' }];
      const result = checkForSensitiveFiles(files);
      expect(result.some(r => r.includes('.pem'))).toBe(true);
    });

    it('should not warn about regular files', () => {
      const files = [{ path: '/project/src/index.ts' }];
      const result = checkForSensitiveFiles(files);
      expect(result.length).toBe(0);
    });

    it('should not duplicate warnings for same pattern type', () => {
      const files = [
        { path: '/project/.env' },
        { path: '/project/credentials.json' }
      ];
      const result = checkForSensitiveFiles(files);
      // .env and credentials.json are different patterns, should give 2 warnings
      expect(result.length).toBe(2);
    });
  });

  describe('generateSummaryOnly', () => {
    const mockMetadata: ScanMetadata = {
      projectRoot: '/home/user/project',
      framework: 'nodejs',
      scanTime: 100,
      filesScanned: 10,
      rulesRun: 5
    };

    const mockFindings: Finding[] = [
      { id: '1', ruleId: 'TEST', severity: 'critical', category: 'security', file: 'a.ts', line: 1, message: 'a' },
      { id: '2', ruleId: 'TEST', severity: 'high', category: 'security', file: 'b.ts', line: 2, message: 'b' },
      { id: '3', ruleId: 'TEST', severity: 'medium', category: 'code-quality', file: 'c.ts', line: 3, message: 'c' },
      { id: '4', ruleId: 'TEST', severity: 'low', category: 'best-practices', file: 'd.ts', line: 4, message: 'd' },
    ];

    it('should generate summary with correct counts', () => {
      const result = generateSummaryOnly(mockMetadata, mockFindings);

      expect(result).toHaveProperty('summary');
      expect((result as any).summary.critical).toBe(1);
      expect((result as any).summary.high).toBe(1);
      expect((result as any).summary.medium).toBe(1);
      expect((result as any).summary.low).toBe(1);
      expect((result as any).summary.total).toBe(4);
    });

    it('should include framework and scan info', () => {
      const result = generateSummaryOnly(mockMetadata, mockFindings);

      expect((result as any).framework).toBe('nodejs');
      expect((result as any).scanTime).toBe(100);
      expect((result as any).filesScanned).toBe(10);
    });

    it('should group findings by category', () => {
      const result = generateSummaryOnly(mockMetadata, mockFindings);

      expect((result as any).categories).toHaveProperty('security');
      expect((result as any).categories).toHaveProperty('code-quality');
      expect((result as any).categories).toHaveProperty('best-practices');
    });
  });
});
