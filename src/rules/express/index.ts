import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const EXPRESS_SYNC_ROUTE: Recommendation = {
  title: 'Use async/await in route handlers',
  description: 'Express route handlers should be async for proper error handling.',
  library: 'Express'
};

const EXPRESS_ERROR_HANDLER: Recommendation = {
  title: 'Add error handler middleware',
  description: 'Express apps should have error handling middleware.',
  library: 'Express'
};

const EXPRESS_HELMET_MISSING: Recommendation = {
  title: 'Add security headers with Helmet',
  description: 'Add Helmet middleware for security headers.',
  library: 'helmet'
};

class SyncRouteRule extends BaseRule {
  id = 'EXPRESS_SYNC_ROUTE';
  name = 'Synchronous code in async route handler';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['express'];
  recommendation = EXPRESS_SYNC_ROUTE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'express') return findings;

    const syncRoutePattern = /app\.(get|post|put|delete|patch)\s*\(\s*['"`]/;

    for (const file of context.files) {
      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        if (syncRoutePattern.test(lines[i])) {
          if (!lines[i].includes('async')) {
            findings.push(this.createFinding(
              context,
              file.path,
              i + 1,
              'Route handler should be async for proper error handling',
              lines[i].trim()
            ));
          }
        }
      }
    }

    return findings;
  }
}

class MissingErrorHandler extends BaseRule {
  id = 'EXPRESS_ERROR_HANDLER';
  name = 'Missing error handler middleware';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['express'];
  recommendation = EXPRESS_ERROR_HANDLER;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'express') return findings;

    const hasErrorHandler = /app\.use\s*\(\s*function\s*\(\s*err/;

    let hasExpressApp = false;
    for (const file of context.files) {
      if (file.content.includes('express()') || file.content.includes('app = ')) {
        hasExpressApp = true;
        if (!hasErrorHandler.test(file.content)) {
          findings.push(this.createFinding(
            context,
            file.path,
            1,
            'No error handler middleware found',
            'app.use((err, req, res, next) => {...})'
          ));
        }
      }
    }

    return findings;
  }
}

class MissingHelmet extends BaseRule {
  id = 'EXPRESS_HELMET_MISSING';
  name = 'Missing security headers';
  category: Category = 'security';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['express'];
  recommendation = EXPRESS_HELMET_MISSING;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'express') return findings;

    let hasExpressApp = false;
    let hasHelmet = false;

    for (const file of context.files) {
      const content = file.content;

      if (content.includes('express()')) {
        hasExpressApp = true;
      }

      if (content.includes('helmet()') || content.includes("require('helmet')")) {
        hasHelmet = true;
      }
    }

    if (hasExpressApp && !hasHelmet) {
      findings.push({
        id: 'EXPRESS_HELMET_MISSING',
        ruleId: 'EXPRESS_HELMET_MISSING',
        severity: 'medium',
        category: 'security',
        framework: 'express',
        file: context.files[0]?.path || 'project',
        message: 'Missing Helmet security headers middleware',
        recommendation: EXPRESS_HELMET_MISSING
      });
    }

    return findings;
  }
}

export class ExpressRules {
  static getRules() {
    return [
      new SyncRouteRule(),
      new MissingErrorHandler(),
      new MissingHelmet()
    ];
  }
}
