import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const COMM_SECRET_HARDCODED: Recommendation = {
  title: 'Remove hardcoded secrets',
  description: 'API keys and secrets should be stored in environment variables, not in source code.',
  library: 'dotenv'
};

const AI_EXPOSED_SECRETS: Recommendation = {
  title: 'Remove NEXT_PUBLIC_ prefix from secret variables',
  description: 'Variables with NEXT_PUBLIC_ prefix are exposed to the browser. Use them only for public config.',
  library: 'Next.js Environment Variables'
};

const COMM_LOG_SENSITIVE: Recommendation = {
  title: 'Remove sensitive data from logs',
  description: 'Logging sensitive data (passwords, tokens, PII). Use redaction or exclude from logs.',
  library: 'pino, winston'
};

const COMM_URL_USER_CREDS: Recommendation = {
  title: 'Remove credentials from URL',
  description: 'Credentials in URL params are visible in browser history and logs. Use headers or body instead.',
  library: 'HTTP Headers'
};

const COMM_CREDENTIALS_COOKIE: Recommendation = {
  title: 'Add secure flag to cookies',
  description: 'Cookies with credentials should have Secure and HttpOnly flags set.',
  library: 'Cookie options'
};

const COMM_SELF_SIGNED_CERT: Recommendation = {
  title: 'Use valid SSL certificates',
  description: 'Self-signed certificates should not be used in production. Use valid SSL certificates.',
  library: 'Let\'s Encrypt'
};

class HardcodedSecretsRule extends BaseRule {
  id = 'COMM_SECRET_HARDCODED';
  name = 'Hardcoded API keys/secrets';
  category: Category = 'security';
  severity: Severity = 'critical';
  frameworks: Framework[] = [];
  recommendation = COMM_SECRET_HARDCODED;

  private secretPatterns = [
    /api[_-]?key/i,
    /secret[_-]?key/i,
    /password/i,
    /token/i,
    /private[_-]?key/i,
    /access[_-]?key/i
  ];

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    for (const file of context.files) {
      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip comments
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*')) {
          continue;
        }

        for (const pattern of this.secretPatterns) {
          if (pattern.test(line)) {
            // Check if it's actually a string assignment (not just a variable name)
            if (line.includes('=') && (line.includes("'") || line.includes('"'))) {
              // Make sure it's not just a type definition
              if (!line.includes(':') || line.includes('= ')) {
                findings.push(this.createFinding(
                  context,
                  file.path,
                  i + 1,
                  'Potential hardcoded secret detected',
                  line.trim()
                ));
              }
            }
          }
        }
      }
    }

    return findings;
  }
}

class ExposedNextjsSecretsRule extends BaseRule {
  id = 'AI_EXPOSED_SECRETS';
  name = 'NEXT_PUBLIC_ on secret variables';
  category: Category = 'security';
  severity: Severity = 'critical';
  frameworks: Framework[] = ['nextjs'];
  recommendation = AI_EXPOSED_SECRETS;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'nextjs') return findings;

    const secretPatterns = [
      /NEXT_PUBLIC_(?:STRIPE_SECRET|SECRET_KEY|API_SECRET|PRIVATE)/i,
      /NEXT_PUBLIC_AWS_SECRET/i,
      /NEXT_PUBLIC_DATABASE_URL/i
    ];

    for (const file of context.files) {
      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        for (const pattern of secretPatterns) {
          if (pattern.test(line)) {
            findings.push(this.createFinding(
              context,
              file.path,
              i + 1,
              'Secret variable exposed to client with NEXT_PUBLIC_ prefix',
              line.trim()
            ));
          }
        }
      }
    }

    return findings;
  }
}

class LogSensitiveRule extends BaseRule {
  id = 'COMM_LOG_SENSITIVE';
  name = 'Logging sensitive data';
  category: Category = 'security';
  severity: Severity = 'high';
  frameworks: Framework[] = [];
  recommendation = COMM_LOG_SENSITIVE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    const sensitivePatterns = [
      /console\.log\s*\([^)]*(?:password|passwd|secret|token|auth|card|credit|ssn|social)/i,
      /logger\.[a-z]+\s*\([^)]*(?:password|passwd|secret|token|auth|card|credit|ssn|social)/i,
    ];

    for (const file of context.files) {
      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        for (const pattern of sensitivePatterns) {
          if (pattern.test(lines[i])) {
            findings.push(this.createFinding(
              context,
              file.path,
              i + 1,
              'Sensitive data being logged - redact passwords, tokens, PII',
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

class UrlUserCredsRule extends BaseRule {
  id = 'COMM_URL_USER_CREDS';
  name = 'Credentials in URL parameters';
  category: Category = 'security';
  severity: Severity = 'high';
  frameworks: Framework[] = [];
  recommendation = COMM_URL_USER_CREDS;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    const urlCredsPattern = /(?:https?:\/\/)?(?:[\w-]+:[^\s@]+@)[\w.-]+/;

    for (const file of context.files) {
      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        if (urlCredsPattern.test(lines[i])) {
          findings.push(this.createFinding(
            context,
            file.path,
            i + 1,
            'Credentials in URL - use headers or body instead',
            lines[i].trim()
          ));
        }
      }
    }

    return findings;
  }
}

class CredentialsCookieRule extends BaseRule {
  id = 'COMM_CREDENTIALS_COOKIE';
  name = 'Cookie without secure flag';
  category: Category = 'security';
  severity: Severity = 'high';
  frameworks: Framework[] = [];
  recommendation = COMM_CREDENTIALS_COOKIE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    const cookiePattern = /res\.cookie\s*\(|cookie\s*\(/;

    for (const file of context.files) {
      const content = file.content;

      if (cookiePattern.test(content)) {
        // Check if secure and httpOnly are set
        if (!content.includes('secure: true') && !content.includes('httpOnly: true')) {
          findings.push(this.createFinding(
            context,
            file.path,
            1,
            'Cookie without Secure and HttpOnly flags - add cookie options',
            content.substring(0, 100)
          ));
        }
      }
    }

    return findings;
  }
}

class SelfSignedCertRule extends BaseRule {
  id = 'COMM_SELF_SIGNED_CERT';
  name = 'Self-signed certificate usage';
  category: Category = 'security';
  severity: Severity = 'medium';
  frameworks: Framework[] = [];
  recommendation = COMM_SELF_SIGNED_CERT;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    const selfSignedPatterns = [
      /rejectUnauthorized:\s*false/,
      /secure:\s*false/,
      /rejectUnauthorized\s*=\s*false/,
    ];

    for (const file of context.files) {
      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        for (const pattern of selfSignedPatterns) {
          if (pattern.test(lines[i])) {
            findings.push(this.createFinding(
              context,
              file.path,
              i + 1,
              'Self-signed certificate or disabled cert validation - use valid certs in production',
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

export class SecretsScanner {
  static getRules() {
    return [
      new HardcodedSecretsRule(),
      new ExposedNextjsSecretsRule(),
      new LogSensitiveRule(),
      new UrlUserCredsRule(),
      new CredentialsCookieRule(),
      new SelfSignedCertRule()
    ];
  }
}
