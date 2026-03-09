import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const FASTIFY_SCHEMA_MISSING: Recommendation = {
  title: 'Add JSON schema to route',
  description: 'Fastify routes should have JSON schema for validation and serialization.',
  library: 'Fastify'
};

const FASTIFY_ASYNC_ERROR: Recommendation = {
  title: 'Use async/await properly',
  description: 'Fastify route handlers should use async/await with proper error handling.',
  library: 'Fastify'
};

const FASTIFY_RATE_LIMIT_MISSING: Recommendation = {
  title: 'Add rate limiting',
  description: 'Add rate limiting to protect against abuse.',
  library: '@fastify/rate-limit'
};

class SchemaMissingRule extends BaseRule {
  id = 'FASTIFY_SCHEMA_MISSING';
  name = 'No JSON schema for route';
  category: Category = 'security';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['fastify'];
  recommendation = FASTIFY_SCHEMA_MISSING;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'fastify') return findings;

    for (const file of context.files) {
      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        // Check for fastify route without schema
        if (lines[i].includes('fastify.get') || lines[i].includes('fastify.post')) {
          // Look for schema in nearby lines
          const nearby = lines.slice(Math.max(0, i - 5), i + 10).join('\n');
          if (!nearby.includes('schema')) {
            findings.push(this.createFinding(
              context,
              file.path,
              i + 1,
              'Route without JSON schema - add for validation',
              lines[i].trim()
            ));
          }
        }
      }
    }

    return findings;
  }
}

class AsyncErrorRule extends BaseRule {
  id = 'FASTIFY_ASYNC_ERROR';
  name = 'Async route without try-catch';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['fastify'];
  recommendation = FASTIFY_ASYNC_ERROR;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'fastify') return findings;

    for (const file of context.files) {
      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        if ((lines[i].includes('async') || lines[i].includes('await')) &&
            (lines[i].includes('fastify.get') || lines[i].includes('fastify.post'))) {
          // Check if there's error handling nearby
          const nearby = lines.slice(i, i + 20).join('\n');
          if (!nearby.includes('try') && !nearby.includes('catch')) {
            findings.push(this.createFinding(
              context,
              file.path,
              i + 1,
              'Async route without try-catch - errors will crash the server',
              lines[i].trim()
            ));
          }
        }
      }
    }

    return findings;
  }
}

class RateLimitMissingRule extends BaseRule {
  id = 'FASTIFY_RATE_LIMIT_MISSING';
  name: string = 'No rate limiting';
  category: Category = 'security';
  severity: Severity = 'high';
  frameworks: Framework[] = ['fastify'];
  recommendation = FASTIFY_RATE_LIMIT_MISSING;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'fastify') return findings;

    let hasFastify = false;
    let hasRateLimit = false;

    for (const file of context.files) {
      const content = file.content;

      if (content.includes('fastify') || content.includes('Fastify')) {
        hasFastify = true;
      }

      if (content.includes('rate-limit') || content.includes('rateLimit')) {
        hasRateLimit = true;
      }
    }

    if (hasFastify && !hasRateLimit) {
      findings.push({
        id: 'FASTIFY_RATE_LIMIT_MISSING',
        ruleId: 'FASTIFY_RATE_LIMIT_MISSING',
        severity: 'high',
        category: 'security',
        framework: 'fastify',
        file: context.files[0]?.path || 'project',
        message: 'No rate limiting configured',
        recommendation: FASTIFY_RATE_LIMIT_MISSING
      });
    }

    return findings;
  }
}

export class FastifyRules {
  static getRules() {
    return [
      new SchemaMissingRule(),
      new AsyncErrorRule(),
      new RateLimitMissingRule()
    ];
  }
}
