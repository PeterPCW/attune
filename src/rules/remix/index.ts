import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const REMIX_LOADER_ERROR: Recommendation = {
  title: 'Handle errors in loader',
  description: 'Loaders should have error handling for proper error states.',
  library: 'Remix'
};

const REMIX_NO_ERROR_BOUNDARY: Recommendation = {
  title: 'Add ErrorBoundary to route',
  description: 'Routes should have ErrorBoundary for graceful error handling.',
  library: 'Remix'
};

const REMIX_CLIENT_ONLY: Recommendation = {
  title: 'Move client-only code to clientLoader or useEffect',
  description: 'Client-only code in loader runs on server. Move to clientLoader or useEffect.',
  library: 'Remix'
};

class LoaderErrorRule extends BaseRule {
  id = 'REMIX_LOADER_ERROR';
  name = 'Loader error not handled';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['remix'];
  recommendation = REMIX_LOADER_ERROR;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'remix') return findings;

    for (const file of context.files) {
      if (!file.path.includes('/routes/')) continue;

      const content = file.content;

      // Check for loader without try-catch
      if (content.includes('export const loader') && !content.includes('try') && !content.includes('throw')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Loader without error handling - add try-catch or throw responses',
          'export const loader'
        ));
      }
    }

    return findings;
  }
}

class NoErrorBoundaryRule extends BaseRule {
  id = 'REMIX_NO_ERROR_BOUNDARY';
  name = 'No ErrorBoundary in route';
  category: Category = 'architecture';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['remix'];
  recommendation = REMIX_NO_ERROR_BOUNDARY;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'remix') return findings;

    for (const file of context.files) {
      if (!file.path.includes('/routes/')) continue;

      const content = file.content;

      // Check for route without ErrorBoundary
      if (content.includes('export const') && !content.includes('ErrorBoundary')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Route without ErrorBoundary - add for graceful error handling',
          'No ErrorBoundary export'
        ));
      }
    }

    return findings;
  }
}

class ClientOnlyRule extends BaseRule {
  id = 'REMIX_CLIENT_ONLY';
  name = 'Client-only code in loader';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['remix'];
  recommendation = REMIX_CLIENT_ONLY;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'remix') return findings;

    for (const file of context.files) {
      if (!file.path.includes('/routes/')) continue;

      const content = file.content;

      // Check for browser APIs in loader
      const browserAPIs = ['document.', 'window.', 'navigator.', 'localStorage', 'sessionStorage'];

      if (content.includes('export const loader')) {
        for (const api of browserAPIs) {
          if (content.includes(api)) {
            findings.push(this.createFinding(
              context,
              file.path,
              1,
              `Browser API ${api} in loader - runs on server`,
              `${api} in loader`
            ));
          }
        }
      }
    }

    return findings;
  }
}

export class RemixRules {
  static getRules() {
    return [
      new LoaderErrorRule(),
      new NoErrorBoundaryRule(),
      new ClientOnlyRule()
    ];
  }
}
