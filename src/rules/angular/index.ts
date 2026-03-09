import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const ANGULAR_SUBSCRIBE_LEAK: Recommendation = {
  title: 'Unsubscribe from observables',
  description: 'Always unsubscribe from observables to prevent memory leaks. Use takeUntilDestroyed or unsubscribe.',
  library: 'RxJS'
};

const ANGULAR_DETECT_CHANGE: Recommendation = {
  title: 'Avoid manual change detection',
  description: 'Manual change detection can cause performance issues. Use OnPush and async pipe.',
  library: 'Angular'
};

const ANGULAR_TEMPLATE_CHANGE: Recommendation = {
  title: 'Avoid method calls in templates',
  description: 'Method calls in templates run on every change detection. Use pipes or computed properties.',
  library: 'Angular'
};

const ANGULAR_PIPE_PURE: Recommendation = {
  title: 'Mark pure pipes',
  description: 'Pipes should be pure by default for performance.',
  library: 'Angular'
};

class SubscribeLeakRule extends BaseRule {
  id = 'ANGULAR_SUBSCRIBE_LEAK';
  name = 'Subscription without unsubscribe';
  category: Category = 'architecture';
  severity: Severity = 'critical';
  frameworks: Framework[] = ['angular'];
  recommendation = ANGULAR_SUBSCRIBE_LEAK;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'angular') return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.ts')) continue;

      const content = file.content;

      // Look for .subscribe without unsubscribe
      if (content.includes('.subscribe(') && !content.includes('unsubscribe') && !content.includes('takeUntil')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Observable subscription without unsubscribe - will cause memory leak',
          '.subscribe() without cleanup'
        ));
      }
    }

    return findings;
  }
}

class DetectChangeRule extends BaseRule {
  id = 'ANGULAR_DETECT_CHANGE';
  name = 'Manual change detection';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['angular'];
  recommendation = ANGULAR_DETECT_CHANGE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'angular') return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.ts')) continue;

      const content = file.content;

      // Look for detectChanges calls
      if (content.includes('detectChanges()') || content.includes('markForCheck()')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Manual change detection - use OnPush and async pipe instead',
          'detectChanges() call'
        ));
      }
    }

    return findings;
  }
}

class TemplateMethodRule extends BaseRule {
  id = 'ANGULAR_TEMPLATE_CHANGE';
  name = 'Method call in template';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['angular'];
  recommendation = ANGULAR_TEMPLATE_CHANGE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'angular') return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.html')) continue;

      const content = file.content;

      // Look for method calls in template
      if (content.includes('(') && content.includes(')')) {
        const methodCalls = content.match(/\{\{\s*\w+\([^)]*\)\s*\}\}/g);
        if (methodCalls && methodCalls.length > 0) {
          findings.push(this.createFinding(
            context,
            file.path,
            1,
            'Method call in template - runs on every change detection',
            'Method in {{ }} binding'
          ));
        }
      }
    }

    return findings;
  }
}

class PipePureRule extends BaseRule {
  id = 'ANGULAR_PIPE_PURE';
  name = 'Impure pipe with expensive computation';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['angular'];
  recommendation = ANGULAR_PIPE_PURE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'angular') return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.ts')) continue;

      const content = file.content;

      // Look for impure pipes
      if (content.includes('@Pipe') && content.includes('pure: false')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Impure pipe runs on every change detection - make pure if possible',
          'pure: false'
        ));
      }
    }

    return findings;
  }
}

export class AngularRules {
  static getRules() {
    return [
      new SubscribeLeakRule(),
      new DetectChangeRule(),
      new TemplateMethodRule(),
      new PipePureRule()
    ];
  }
}
