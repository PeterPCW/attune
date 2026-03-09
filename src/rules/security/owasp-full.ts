import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const OWASP_A01_BROKEN_ACCESS: Recommendation = {
  title: 'Add ownership verification',
  description: 'IDOR risk: Verify user ownership before accessing or modifying resources.',
  library: 'Authorization'
};

const OWASP_A04_INSECURE_DESIGN: Recommendation = {
  title: 'Add input validation',
  description: 'Missing input validation. Validate all user inputs.',
  library: 'Zod, Yup'
};

const OWASP_A05_MISCONFIG: Recommendation = {
  title: 'Disable debug mode in production',
  description: 'Debug mode should be disabled in production.',
  library: 'Configuration'
};

const OWASP_A07_AUTH_FAIL: Recommendation = {
  title: 'Strengthen password policy',
  description: 'Add password strength validation and requirements.',
  library: 'zxcvbn'
};

const OWASP_A10_SSRF: Recommendation = {
  title: 'Validate URL before fetching',
  description: 'SSRF risk: Validate and sanitize URLs before fetching.',
  library: 'URL validation'
};

const OWASP_A02_CRYPTO_FAIL: Recommendation = {
  title: 'Remove hardcoded encryption keys',
  description: 'Encryption keys must be loaded from environment variables, never hardcoded.',
  library: 'dotenv'
};

const OWASP_A06_VULN_COMPONENT: Recommendation = {
  title: 'Update vulnerable dependencies',
  description: 'Known vulnerable dependencies detected. Run npm audit and update packages.',
  library: 'npm audit'
};

const OWASP_A08_INTEGRITY_FAIL: Recommendation = {
  title: 'Validate file uploads',
  description: 'File uploads must be validated. Check file type, size, and content.',
  library: 'File validation'
};

const OWASP_A09_LOGGING_FAIL: Recommendation = {
  title: 'Add error logging',
  description: 'Missing error logging. Add proper logging for security events.',
  library: 'pino, winston'
};

class BrokenAccessControlRule extends BaseRule {
  id = 'OWASP_A01_BROKEN_ACCESS';
  name = 'IDOR - missing ownership verification';
  category: Category = 'security';
  severity: Severity = 'critical';
  frameworks: Framework[] = [];
  recommendation = OWASP_A01_BROKEN_ACCESS;
  metadata = { owaspCategory: 'A01:2021' };

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    for (const file of context.files) {
      // Skip rule definition files - these contain example patterns
      if (file.path.includes('/rules/')) continue;

      const content = file.content;
      const lines = content.split('\n');

      // Look for database queries without user verification
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('.findUnique') || lines[i].includes('.findFirst') || lines[i].includes('query(')) {
          // Check if there's user ID check nearby
          const nearby = lines.slice(Math.max(0, i - 5), i + 10).join('\n');
          if (!nearby.includes('userId') && !nearby.includes('owner') && !nearby.includes('where:')) {
            findings.push(this.createFinding(
              context,
              file.path,
              i + 1,
              'Potential IDOR - no ownership verification before data access',
              lines[i].trim()
            ));
          }
        }
      }
    }

    return findings;
  }
}

class InsecureDesignRule extends BaseRule {
  id = 'OWASP_A04_INSECURE_DESIGN';
  name = 'Missing input validation';
  category: Category = 'security';
  severity: Severity = 'high';
  frameworks: Framework[] = [];
  recommendation = OWASP_A04_INSECURE_DESIGN;
  metadata = { owaspCategory: 'A04:2021' };

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    for (const file of context.files) {
      // Skip rule definition files, internal CLI/core files, and formatters
      if (file.path.includes('/rules/') || file.path.includes('/cli/') || file.path.includes('/core/') || file.path.includes('/formatters/')) continue;

      const content = file.content;

      // Look for function params without validation
      const funcParams = content.match(/function\s+\w+\s*\(([^)]+)\)/g);
      if (funcParams) {
        for (const param of funcParams) {
          // If no validation library is imported
          if (!content.includes('zod') && !content.includes('yup') && !content.includes('joi')) {
            findings.push(this.createFinding(
              context,
              file.path,
              1,
              'Function parameters without validation - add Zod or Yup',
              'No input validation'
            ));
            break;
          }
        }
      }
    }

    return findings;
  }
}

class MisconfigRule extends BaseRule {
  id = 'OWASP_A05_MISCONFIG';
  name = 'Debug mode enabled in production';
  category: Category = 'security';
  severity: Severity = 'high';
  frameworks: Framework[] = [];
  recommendation = OWASP_A05_MISCONFIG;
  metadata = { owaspCategory: 'A05:2021' };

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    for (const file of context.files) {
      // Skip rule definition files
      if (file.path.includes('/rules/')) continue;

      const content = file.content;

      // Check for debug mode in production
      if (content.includes('debug: true') || content.includes('DEBUG=true')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Debug mode enabled - disable in production',
          'debug: true'
        ));
      }
    }

    return findings;
  }
}

class AuthFailRule extends BaseRule {
  id = 'OWASP_A07_AUTH_FAIL';
  name = 'Weak authentication policy';
  category: Category = 'security';
  severity: Severity = 'high';
  frameworks: Framework[] = [];
  recommendation = OWASP_A07_AUTH_FAIL;
  metadata = { owaspCategory: 'A07:2021' };

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    for (const file of context.files) {
      // Skip rule definition files
      if (file.path.includes('/rules/')) continue;

      const content = file.content;

      // Check for password handling without validation
      if (content.includes('password') || content.includes(' Password')) {
        if (!content.includes('zxcvbn') && !content.includes('validatePassword')) {
          findings.push(this.createFinding(
            context,
            file.path,
            1,
            'Password handling without strength validation - add zxcvbn',
            'No password strength check'
          ));
        }
      }
    }

    return findings;
  }
}

class SSRFRule extends BaseRule {
  id = 'OWASP_A10_SSRF';
  name = 'Unvalidated URL redirects';
  category: Category = 'security';
  severity: Severity = 'high';
  frameworks: Framework[] = [];
  recommendation = OWASP_A10_SSRF;
  metadata = { owaspCategory: 'A10:2021' };

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    for (const file of context.files) {
      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        // Look for fetch/axios with URL from user input
        if ((lines[i].includes('fetch(') || lines[i].includes('axios(')) &&
            (lines[i].includes('req.query') || lines[i].includes('req.params') || lines[i].includes('body'))) {
          findings.push(this.createFinding(
            context,
            file.path,
            i + 1,
            'Potential SSRF - URL from user input without validation',
            lines[i].trim()
          ));
        }
      }
    }

    return findings;
  }
}

class CryptoFailRule extends BaseRule {
  id = 'OWASP_A02_CRYPTO_FAIL';
  name = 'Hardcoded encryption keys';
  category: Category = 'security';
  severity: Severity = 'critical';
  frameworks: Framework[] = [];
  recommendation = OWASP_A02_CRYPTO_FAIL;
  metadata = { owaspCategory: 'A02:2021' };

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    const cryptoPatterns = [
      /cipher\s*=\s*['"][^'"]+['"]/,
      /encryptionKey\s*=\s*['"][^'"]+['"]/,
      /secret\s*=\s*['"][^'"]+['"]/,
      /key:\s*['"][a-zA-Z0-9+/=]{16,}['"]/,
      /crypto\.createCipher/i,
    ];

    for (const file of context.files) {
      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        for (const pattern of cryptoPatterns) {
          if (pattern.test(lines[i])) {
            findings.push(this.createFinding(
              context,
              file.path,
              i + 1,
              'Hardcoded encryption key detected - use environment variables',
              lines[i].trim()
            ));
            break;
          }
        }
      }
    }

    return findings;
  }
}

class VulnComponentRule extends BaseRule {
  id = 'OWASP_A06_VULN_COMPONENT';
  name = 'Known vulnerable dependencies';
  category: Category = 'security';
  severity: Severity = 'critical';
  frameworks: Framework[] = [];
  recommendation = OWASP_A06_VULN_COMPONENT;
  metadata = { owaspCategory: 'A06:2021' };

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    // Check package.json for vulnerable packages
    if (context.packageJson) {
      const knownVulnerable: Record<string, string> = {
        'lodash': '4.17.21',
        'minimist': '1.2.5',
        'node-forge': '0.10.0',
        'json5': '<2.2.2',
        'axios': '<1.6.0',
      };

      // Check production dependencies
      const prodDeps = context.packageJson.dependencies || {};
      for (const [pkg, minVersion] of Object.entries(knownVulnerable)) {
        if (prodDeps[pkg]) {
          findings.push({
            id: 'OWASP_A06_VULN_COMPONENT',
            ruleId: 'OWASP_A06_VULN_COMPONENT',
            severity: 'critical',
            category: 'security',
            file: 'package.json',
            message: `Known vulnerable package: ${pkg} ${prodDeps[pkg]} (minimum safe: ${minVersion})`,
            recommendation: OWASP_A06_VULN_COMPONENT
          });
        }
      }

      // Check devDependencies only if ignoreDevDeps is NOT set
      if (!context.options?.ignoreDevDeps) {
        const devDeps = context.packageJson.devDependencies || {};
        for (const [pkg, minVersion] of Object.entries(knownVulnerable)) {
          if (devDeps[pkg]) {
            findings.push({
              id: 'OWASP_A06_VULN_COMPONENT',
              ruleId: 'OWASP_A06_VULN_COMPONENT',
              severity: 'critical',
              category: 'security',
              file: 'package.json',
              message: `Known vulnerable package in devDependencies: ${pkg} ${devDeps[pkg]} (minimum safe: ${minVersion})`,
              recommendation: OWASP_A06_VULN_COMPONENT
            });
          }
        }
      }
    }

    return findings;
  }
}

class IntegrityFailRule extends BaseRule {
  id = 'OWASP_A08_INTEGRITY_FAIL';
  name = 'Unvalidated file uploads';
  category: Category = 'security';
  severity: Severity = 'high';
  frameworks: Framework[] = [];
  recommendation = OWASP_A08_INTEGRITY_FAIL;
  metadata = { owaspCategory: 'A08:2021' };

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    const uploadPatterns = [
      /multer/i,
      /upload/i,
      /formidable/i,
      /busboy/i,
      /fileupload/i,
      /parseMultipart/i,
    ];

    for (const file of context.files) {
      const content = file.content;

      for (const pattern of uploadPatterns) {
        if (pattern.test(content)) {
          // Check if validation exists
          if (!content.includes('fileFilter') && !content.includes('validateFile') && !content.includes('mimeType')) {
            findings.push(this.createFinding(
              context,
              file.path,
              1,
              'File upload handler without validation - add file type and size validation',
              content.substring(0, 100)
            ));
            break;
          }
        }
      }
    }

    return findings;
  }
}

class LoggingFailRule extends BaseRule {
  id = 'OWASP_A09_LOGGING_FAIL';
  name = 'Missing error logging';
  category: Category = 'security';
  severity: Severity = 'medium';
  frameworks: Framework[] = [];
  recommendation = OWASP_A09_LOGGING_FAIL;
  metadata = { owaspCategory: 'A09:2021' };

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    // Check if any logging library is used
    const hasLogger = context.files.some(f =>
      f.content.includes('winston') ||
      f.content.includes('pino') ||
      f.content.includes('loglevel') ||
      f.content.includes('electron-log')
    );

    if (!hasLogger && context.files.length > 0) {
      findings.push({
        id: 'OWASP_A09_LOGGING_FAIL',
        ruleId: 'OWASP_A09_LOGGING_FAIL',
        severity: 'medium',
        category: 'security',
        file: context.files[0].path,
        message: 'No logging library detected - add structured logging',
        recommendation: OWASP_A09_LOGGING_FAIL
      });
    }

    return findings;
  }
}

export class OwaspFullScanner {
  static getRules() {
    return [
      new BrokenAccessControlRule(),
      new InsecureDesignRule(),
      new MisconfigRule(),
      new AuthFailRule(),
      new SSRFRule(),
      new CryptoFailRule(),
      new VulnComponentRule(),
      new IntegrityFailRule(),
      new LoggingFailRule()
    ];
  }
}
