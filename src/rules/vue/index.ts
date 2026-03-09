import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const VUE_PROP_DEFAULT_MUTATION: Recommendation = {
  title: 'Do not mutate props',
  description: 'Props should be treated as read-only. Use a local copy if you need to modify it.',
  library: 'Vue'
};

const VUE_V_FOR_INDEX: Recommendation = {
  title: 'Add key to v-for',
  description: 'v-for should always have a unique key for proper list rendering.',
  library: 'Vue'
};

const VUE_WATCH_IMMEDIATE: Recommendation = {
  title: 'Use immediate option for watch on mount',
  description: 'If you need the initial value in watch, use immediate: true.',
  library: 'Vue'
};

const VUE_REACTIVITY_LEAK: Recommendation = {
  title: 'Fix unreactive object mutation',
  description: 'Mutating objects directly breaks Vue reactivity. Use reactive() properly.',
  library: 'Vue'
};

const VUE_COMPOSABLE_SIDE_EFFECT: Recommendation = {
  title: 'Avoid side effects in composables',
  description: 'Composables with side effects should be explicit about them.',
  library: 'Vue'
};

const VUE_SCOPE_CSS: Recommendation = {
  title: 'Avoid deep selectors in scoped CSS',
  description: 'Deep selectors in scoped CSS can cause maintenance issues.',
  library: 'Vue'
};

const VUE_ASYNC_COMPONENT: Recommendation = {
  title: 'Add loading component for async components',
  description: 'Async components should have a loading component.',
  library: 'Vue'
};

const VUE_EMIT_WITHOUT_DECLARE: Recommendation = {
  title: 'Declare emits in component',
  description: 'Emits should be declared in the component for type safety.',
  library: 'Vue'
};

const VUE_REACTIVE_PRIMITIVE: Recommendation = {
  title: 'Use correct reactivity primitive',
  description: 'Use ref() for primitives and reactive() for objects.',
  library: 'Vue'
};

const VUE_PROVIDE_INJECT: Recommendation = {
  title: 'Use provide/inject correctly',
  description: 'Provide/inject should maintain reactivity.',
  library: 'Vue'
};

const VUE_STORE_ACTION_TYPE: Recommendation = {
  title: 'Use typed store actions',
  description: 'String-based actions reduce type safety. Use typed actions.',
  library: 'Pinia'
};

const VUE_MIXINS_DEPRECATED: Recommendation = {
  title: 'Avoid using mixins',
  description: 'Mixins are deprecated. Use composables instead.',
  library: 'Vue'
};

class PropMutationRule extends BaseRule {
  id = 'VUE_PROP_DEFAULT_MUTATION';
  name = 'Mutating prop in component';
  category: Category = 'architecture';
  severity: Severity = 'critical';
  frameworks: Framework[] = ['vue', 'nuxt'];
  recommendation = VUE_PROP_DEFAULT_MUTATION;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['vue', 'nuxt'].includes(context.framework)) return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.vue')) continue;

      const content = file.content;

      // Look for direct mutation of props (simplified)
      if (content.includes('props.') && content.includes('=')) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('props.') && lines[i].includes('=') && !lines[i].includes(':')) {
            findings.push(this.createFinding(
              context,
              file.path,
              i + 1,
              'Direct mutation of props - use local state instead',
              lines[i].trim()
            ));
          }
        }
      }
    }

    return findings;
  }
}

class VForKeyRule extends BaseRule {
  id = 'VUE_V_FOR_INDEX';
  name = 'v-for without key';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['vue', 'nuxt'];
  recommendation = VUE_V_FOR_INDEX;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['vue', 'nuxt'].includes(context.framework)) return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.vue')) continue;

      const content = file.content;

      if (content.includes('v-for') && !content.includes(':key=')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'v-for without key prop',
          'v-for without :key='
        ));
      }
    }

    return findings;
  }
}

class WatchImmediateRule extends BaseRule {
  id = 'VUE_WATCH_IMMEDIATE';
  name = 'watch without immediate option';
  category: Category = 'architecture';
  severity: Severity = 'low';
  frameworks: Framework[] = ['vue', 'nuxt'];
  recommendation = VUE_WATCH_IMMEDIATE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['vue', 'nuxt'].includes(context.framework)) return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.vue')) continue;

      const content = file.content;

      if (content.includes('watch(') && !content.includes('immediate')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'watch() without immediate option - may miss initial value',
          'watch without immediate'
        ));
      }
    }

    return findings;
  }
}

class ReactivityLeakRule extends BaseRule {
  id = 'VUE_REACTIVITY_LEAK';
  name = 'Unreactive object mutation';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['vue', 'nuxt'];
  recommendation = VUE_REACTIVITY_LEAK;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['vue', 'nuxt'].includes(context.framework)) return findings;

    return findings;
  }
}

class ComposableSideEffectRule extends BaseRule {
  id = 'VUE_COMPOSABLE_SIDE_EFFECT';
  name = 'Composable with side effects';
  category: Category = 'architecture';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['vue', 'nuxt'];
  recommendation = VUE_COMPOSABLE_SIDE_EFFECT;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['vue', 'nuxt'].includes(context.framework)) return findings;

    return findings;
  }
}

class ScopedCssRule extends BaseRule {
  id = 'VUE_SCOPE_CSS';
  name = 'Deep selectors in scoped CSS';
  category: Category = 'performance';
  severity: Severity = 'low';
  frameworks: Framework[] = ['vue', 'nuxt'];
  recommendation = VUE_SCOPE_CSS;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['vue', 'nuxt'].includes(context.framework)) return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.vue')) continue;

      const content = file.content;

      if (content.includes('scoped') && content.includes('>>>')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Deep selectors in scoped CSS can cause issues - consider using normal selectors',
          '>>> in scoped CSS'
        ));
      }
    }

    return findings;
  }
}

class AsyncComponentRule extends BaseRule {
  id = 'VUE_ASYNC_COMPONENT';
  name = 'Async component without loading';
  category: Category = 'performance';
  severity: Severity = 'low';
  frameworks: Framework[] = ['vue', 'nuxt'];
  recommendation = VUE_ASYNC_COMPONENT;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['vue', 'nuxt'].includes(context.framework)) return findings;

    return findings;
  }
}

class EmitWithoutDeclareRule extends BaseRule {
  id = 'VUE_EMIT_WITHOUT_DECLARE';
  name = 'Emits without declaration';
  category: Category = 'typescript';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['vue', 'nuxt'];
  recommendation = VUE_EMIT_WITHOUT_DECLARE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['vue', 'nuxt'].includes(context.framework)) return findings;

    return findings;
  }
}

class ReactivePrimitiveRule extends BaseRule {
  id = 'VUE_REACTIVE_PRIMITIVE';
  name = 'Wrong reactivity primitive';
  category: Category = 'architecture';
  severity: Severity = 'low';
  frameworks: Framework[] = ['vue', 'nuxt'];
  recommendation = VUE_REACTIVE_PRIMITIVE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['vue', 'nuxt'].includes(context.framework)) return findings;

    return findings;
  }
}

class ProvideInjectRule extends BaseRule {
  id = 'VUE_PROVIDE_INJECT';
  name = 'Provide/inject without reactivity';
  category: Category = 'architecture';
  severity: Severity = 'low';
  frameworks: Framework[] = ['vue', 'nuxt'];
  recommendation = VUE_PROVIDE_INJECT;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['vue', 'nuxt'].includes(context.framework)) return findings;

    return findings;
  }
}

class StoreActionTypeRule extends BaseRule {
  id = 'VUE_STORE_ACTION_TYPE';
  name = 'String-based store actions';
  category: Category = 'typescript';
  severity: Severity = 'low';
  frameworks: Framework[] = ['vue', 'nuxt'];
  recommendation = VUE_STORE_ACTION_TYPE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['vue', 'nuxt'].includes(context.framework)) return findings;

    return findings;
  }
}

class MixinsDeprecatedRule extends BaseRule {
  id = 'VUE_MIXINS_DEPRECATED';
  name = 'Using deprecated mixins';
  category: Category = 'architecture';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['vue', 'nuxt'];
  recommendation = VUE_MIXINS_DEPRECATED;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['vue', 'nuxt'].includes(context.framework)) return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.vue')) continue;

      const content = file.content;

      if (content.includes('mixins:')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Mixins are deprecated in Vue 3 - use composables instead',
          'mixins usage'
        ));
      }
    }

    return findings;
  }
}

export class VueRules {
  static getRules() {
    return [
      new PropMutationRule(),
      new VForKeyRule(),
      new WatchImmediateRule(),
      new ReactivityLeakRule(),
      new ComposableSideEffectRule(),
      new ScopedCssRule(),
      new AsyncComponentRule(),
      new EmitWithoutDeclareRule(),
      new ReactivePrimitiveRule(),
      new ProvideInjectRule(),
      new StoreActionTypeRule(),
      new MixinsDeprecatedRule()
    ];
  }
}
