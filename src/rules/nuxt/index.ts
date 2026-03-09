import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const NUXT_CONFIG_PUBLIC: Recommendation = {
  title: 'Move secrets out of public config',
  description: 'Runtime config public keys are exposed to the client. Use private keys for secrets.',
  library: 'Nuxt'
};

const NUXT_SERVER_ROUTE_SYNC: Recommendation = {
  title: 'Use async/await in server routes',
  description: 'Server routes should use async/await for proper error handling.',
  library: 'Nuxt'
};

class ConfigPublicRule extends BaseRule {
  id = 'NUXT_CONFIG_PUBLIC';
  name = 'Secrets in public config';
  category: Category = 'security';
  severity: Severity = 'critical';
  frameworks: Framework[] = ['nuxt'];
  recommendation = NUXT_CONFIG_PUBLIC;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'nuxt') return findings;

    for (const file of context.files) {
      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('runtimeConfig') && lines[i].includes('public')) {
          if (lines[i].includes('secret') || lines[i].includes('key') || lines[i].includes('password')) {
            findings.push(this.createFinding(
              context,
              file.path,
              i + 1,
              'Potential secret in public runtime config',
              lines[i].trim()
            ));
          }
        }
      }
    }

    return findings;
  }
}

class ServerRouteSyncRule extends BaseRule {
  id = 'NUXT_SERVER_ROUTE_SYNC';
  name = 'Sync code in server route';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['nuxt'];
  recommendation = NUXT_SERVER_ROUTE_SYNC;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'nuxt') return findings;

    for (const file of context.files) {
      if (!file.path.includes('/server/')) continue;

      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('defineEventHandler') && !lines[i].includes('async')) {
          findings.push(this.createFinding(
            context,
            file.path,
            i + 1,
            'Server route handler should be async',
            lines[i].trim()
          ));
        }
      }
    }

    return findings;
  }
}

export class NuxtRules {
  static getRules() {
    return [
      new ConfigPublicRule(),
      new ServerRouteSyncRule()
    ];
  }
}
