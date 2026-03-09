import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const OWASP_A03_INJECTION: Recommendation = {
  title: 'Use parameterized queries',
  description: 'SQL injection risk. Use parameterized queries or an ORM.',
  library: 'Prisma, Drizzle, Knex'
};

const OWASP_A03_CMD_INJECTION: Recommendation = {
  title: 'Avoid exec/eval with user input',
  description: 'Command injection risk. Avoid shell execution with unsanitized input.',
  library: 'child_process (with proper escaping)'
};

class SqlInjectionRule extends BaseRule {
  id = 'OWASP_A03_INJECTION';
  name = 'SQL injection via string concatenation';
  category: Category = 'security';
  severity: Severity = 'critical';
  frameworks: Framework[] = [];
  recommendation = OWASP_A03_INJECTION;
  metadata = { owaspCategory: 'A03:2021' };

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    const dangerousPatterns = [
      /query\s*\(\s*['"`].*\+/,
      /execute\s*\(\s*['"`].*\+/,
      /\.sql\s*`.*\$\{/,
      /pool\.query\s*\(\s*['"`].*\+/
    ];

    for (const file of context.files) {
      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        for (const pattern of dangerousPatterns) {
          if (pattern.test(line)) {
            findings.push(this.createFinding(
              context,
              file.path,
              i + 1,
              'Potential SQL injection - string concatenation in query',
              line.trim()
            ));
          }
        }
      }
    }

    return findings;
  }
}

class CommandInjectionRule extends BaseRule {
  id = 'OWASP_A03_INJECTION_CMD';
  name = 'Command injection via exec/eval';
  category: Category = 'security';
  severity: Severity = 'critical';
  frameworks: Framework[] = [];
  recommendation = OWASP_A03_CMD_INJECTION;
  metadata = { owaspCategory: 'A03:2021' };

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    const dangerousPatterns = [
      /exec\s*\([^)]+\+/,
      /execSync\s*\([^)]+\+/,
      /eval\s*\(/,
      /child_process.*exec\s*\(\s*.*\+/
    ];

    for (const file of context.files) {
      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        for (const pattern of dangerousPatterns) {
          if (pattern.test(line)) {
            findings.push(this.createFinding(
              context,
              file.path,
              i + 1,
              'Potential command injection - exec/eval with concatenation',
              line.trim()
            ));
          }
        }
      }
    }

    return findings;
  }
}

export class OwaspScanner {
  static getRules() {
    return [
      new SqlInjectionRule(),
      new CommandInjectionRule()
    ];
  }
}
