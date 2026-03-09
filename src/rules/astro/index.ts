import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const ASTRO_CLIENT_LOAD: Recommendation = {
  title: 'Use client directives only when needed',
  description: 'Only hydrate components that need interactivity. Avoid client:load on static content.',
  library: 'Astro'
};

const ASTRO_NO_PRERENDER: Recommendation = {
  title: 'Add prerender for static pages',
  description: 'Static pages should use prerender for better performance.',
  library: 'Astro'
};

const ASTRO_DIRECTIVE_WRONG: Recommendation = {
  title: 'Use correct hydration directive',
  description: 'Choose appropriate directive: client:load, client:visible, client:idle, etc.',
  library: 'Astro'
};

class ClientLoadRule extends BaseRule {
  id = 'ASTRO_CLIENT_LOAD';
  name = 'Hydrating everything';
  category: Category = 'performance';
  severity: Severity = 'low';
  frameworks: Framework[] = ['astro'];
  recommendation = ASTRO_CLIENT_LOAD;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'astro') return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.astro')) continue;

      const content = file.content;
      const lines = content.split('\n');

      let clientCount = 0;
      for (const line of lines) {
        if (line.includes('client:')) {
          clientCount++;
        }
      }

      // If many client directives, warn
      if (clientCount > 5) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          `Many client directives (${clientCount}) - consider server rendering`,
          `${clientCount} client:* directives`
        ));
      }
    }

    return findings;
  }
}

class NoPrerenderRule extends BaseRule {
  id = 'ASTRO_NO_PRERENDER';
  name = 'Missing prerender';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['astro'];
  recommendation = ASTRO_NO_PRERENDER;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'astro') return findings;

    for (const file of context.files) {
      if (!file.path.includes('/pages/') && !file.path.endsWith('.astro')) continue;

      const content = file.content;

      // Check for pages without prerender
      if (file.path.includes('/pages/') && !content.includes('export const prerender')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Page without prerender - add for static generation',
          'export const prerender = true'
        ));
      }
    }

    return findings;
  }
}

class DirectiveWrongRule extends BaseRule {
  id = 'ASTRO_DIRECTIVE_WRONG';
  name = 'Wrong hydration directive';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['astro'];
  recommendation = ASTRO_DIRECTIVE_WRONG;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'astro') return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.astro')) continue;

      const content = file.content;

      // Check for client:load on below-fold content
      if (content.includes('client:load')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Using client:load - consider client:visible or client:idle for better performance',
          'client:load'
        ));
      }
    }

    return findings;
  }
}

export class AstroRules {
  static getRules() {
    return [
      new ClientLoadRule(),
      new NoPrerenderRule(),
      new DirectiveWrongRule()
    ];
  }
}
