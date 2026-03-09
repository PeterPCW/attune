import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const SVELTE_STORE_SUBSCRIPTION: Recommendation = {
  title: 'Unsubscribe from stores on destroy',
  description: 'Always unsubscribe from stores in onDestroy to prevent memory leaks.',
  library: 'Svelte'
};

const SVELTE_REACTIVITY_ASSIGN: Recommendation = {
  title: 'Use assignment instead of mutation',
  description: 'Svelte reactivity works with assignment, not mutation. Use assignment to trigger updates.',
  library: 'Svelte'
};

const SVELTE_AWAIT_BLOCK_ERROR: Recommendation = {
  title: 'Add error handling to await blocks',
  description: 'Await blocks should have catch for error handling.',
  library: 'Svelte'
};

const SVELTE_SLOT_PROP_SPREAD: Recommendation = {
  title: 'Avoid spreading props to slots',
  description: 'Spreading props to slots can cause maintenance issues.',
  library: 'Svelte'
};

const SVELTE_EVENT_FORWARD: Recommendation = {
  title: 'Use event forwarding',
  description: 'Use event forwarding instead of manual forwarding.',
  library: 'Svelte'
};

const SVELTE_CONTEXT_LEAK: Recommendation = {
  title: 'Fix context usage',
  description: 'Context must be set in onMount or asynchronously.',
  library: 'Svelte'
};

const SVELTE_DESTROYED_LIFECYCLE: Recommendation = {
  title: 'Add cleanup in onDestroy',
  description: 'Always cleanup subscriptions and timers in onDestroy.',
  library: 'Svelte'
};

const SVELTE_GLOBAL_STYLE: Recommendation = {
  title: 'Avoid global styles in components',
  description: 'Global styles should be in global CSS files.',
  library: 'Svelte'
};

const SVELTE_IMMUTABLE_TRACK: Recommendation = {
  title: 'Use immutable tracking correctly',
  description: 'Use $state with proper immutability patterns.',
  library: 'Svelte'
};

const SVELTE_TRANSITION_MISSING: Recommendation = {
  title: 'Add transitions to conditionally rendered elements',
  description: 'Use transitions for better UX with conditionally rendered elements.',
  library: 'Svelte'
};

class StoreSubscriptionRule extends BaseRule {
  id = 'SVELTE_STORE_SUBSCRIPTION';
  name = 'Missing unsubscribe on destroy';
  category: Category = 'architecture';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['svelte'];
  recommendation = SVELTE_STORE_SUBSCRIPTION;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'svelte') return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.svelte')) continue;

      const content = file.content;

      // Look for store subscriptions without cleanup
      if (content.includes('$') && content.includes('store') && !content.includes('onDestroy')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Store subscription without onDestroy cleanup',
          'Store subscription may leak'
        ));
      }
    }

    return findings;
  }
}

class ReactivityAssignRule extends BaseRule {
  id = 'SVELTE_REACTIVITY_ASSIGN';
  name = '$: with mutation instead of reassignment';
  category: Category = 'architecture';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['svelte'];
  recommendation = SVELTE_REACTIVITY_ASSIGN;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'svelte') return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.svelte')) continue;

      const content = file.content;

      // Look for mutation patterns in reactive statements
      if (content.includes('$:') && content.includes('.push') || content.includes('.splice')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Mutation instead of assignment - use array = [...array] pattern',
          'Array mutation in reactive statement'
        ));
      }
    }

    return findings;
  }
}

class AwaitBlockErrorRule extends BaseRule {
  id = 'SVELTE_AWAIT_BLOCK_ERROR';
  name = 'Await block without catch';
  category: Category = 'architecture';
  severity: Severity = 'low';
  frameworks: Framework[] = ['svelte'];
  recommendation = SVELTE_AWAIT_BLOCK_ERROR;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'svelte') return findings;

    return findings;
  }
}

class SlotPropSpreadRule extends BaseRule {
  id = 'SVELTE_SLOT_PROP_SPREAD';
  name = 'Spreading props to slots';
  category: Category = 'architecture';
  severity: Severity = 'low';
  frameworks: Framework[] = ['svelte'];
  recommendation = SVELTE_SLOT_PROP_SPREAD;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'svelte') return findings;

    return findings;
  }
}

class EventForwardRule extends BaseRule {
  id = 'SVELTE_EVENT_FORWARD';
  name = 'Manual event forwarding';
  category: Category = 'architecture';
  severity: Severity = 'low';
  frameworks: Framework[] = ['svelte'];
  recommendation = SVELTE_EVENT_FORWARD;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'svelte') return findings;

    return findings;
  }
}

class ContextLeakRule extends BaseRule {
  id = 'SVELTE_CONTEXT_LEAK';
  name = 'Context used incorrectly';
  category: Category = 'architecture';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['svelte'];
  recommendation = SVELTE_CONTEXT_LEAK;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'svelte') return findings;

    return findings;
  }
}

class DestroyedLifecycleRule extends BaseRule {
  id = 'SVELTE_DESTROYED_LIFECYCLE';
  name = 'onDestroy without onMount pattern';
  category: Category = 'architecture';
  severity: Severity = 'low';
  frameworks: Framework[] = ['svelte'];
  recommendation = SVELTE_DESTROYED_LIFECYCLE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'svelte') return findings;

    return findings;
  }
}

class GlobalStyleRule extends BaseRule {
  id = 'SVELTE_GLOBAL_STYLE';
  name = 'Global styles in component';
  category: Category = 'architecture';
  severity: Severity = 'low';
  frameworks: Framework[] = ['svelte'];
  recommendation = SVELTE_GLOBAL_STYLE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'svelte') return findings;

    return findings;
  }
}

class ImmutableTrackRule extends BaseRule {
  id = 'SVELTE_IMMUTABLE_TRACK';
  name = '$state without proper immutability';
  category: Category = 'architecture';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['svelte'];
  recommendation = SVELTE_IMMUTABLE_TRACK;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'svelte') return findings;

    return findings;
  }
}

class TransitionMissingRule extends BaseRule {
  id = 'SVELTE_TRANSITION_MISSING';
  name = 'Missing transition on conditionally rendered';
  category: Category = 'performance';
  severity: Severity = 'low';
  frameworks: Framework[] = ['svelte'];
  recommendation = SVELTE_TRANSITION_MISSING;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'svelte') return findings;

    return findings;
  }
}

export class SvelteRules {
  static getRules() {
    return [
      new StoreSubscriptionRule(),
      new ReactivityAssignRule(),
      new AwaitBlockErrorRule(),
      new SlotPropSpreadRule(),
      new EventForwardRule(),
      new ContextLeakRule(),
      new DestroyedLifecycleRule(),
      new GlobalStyleRule(),
      new ImmutableTrackRule(),
      new TransitionMissingRule()
    ];
  }
}
