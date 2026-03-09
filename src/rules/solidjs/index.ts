import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const SOLID_REACTIVITY_WRONG: Recommendation = {
  title: 'Use SolidJS reactivity correctly',
  description: 'SolidJS uses signals, not hooks like React. Do not use useState, useEffect.',
  library: 'SolidJS'
};

const SOLID_ARRAY_MUTATION: Recommendation = {
  title: 'Use immutable patterns for arrays',
  description: 'SolidJS reactivity requires reassignment, not mutation. Use [...arr] pattern.',
  library: 'SolidJS'
};

const SOLID_FOR_KEY: Recommendation = {
  title: 'Add key to For component',
  description: 'SolidJS For component needs a key function for proper list updates.',
  library: 'SolidJS'
};

class ReactivityWrongRule extends BaseRule {
  id = 'SOLID_REACTIVITY_WRONG';
  name = 'Using React patterns in Solid';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['solidjs'];
  recommendation = SOLID_REACTIVITY_WRONG;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'solidjs') return findings;

    const reactHooks = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext'];

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx') && !file.path.endsWith('.ts')) continue;

      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        for (const hook of reactHooks) {
          if (lines[i].includes(hook)) {
            findings.push(this.createFinding(
              context,
              file.path,
              i + 1,
              `React hook ${hook} used in SolidJS - use createSignal, createEffect instead`,
              hook
            ));
          }
        }
      }
    }

    return findings;
  }
}

class ArrayMutationRule extends BaseRule {
  id = 'SOLID_ARRAY_MUTATION';
  name = 'Mutating arrays in reactivity';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['solidjs'];
  recommendation = SOLID_ARRAY_MUTATION;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'solidjs') return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx') && !file.path.endsWith('.ts')) continue;

      const content = file.content;

      // Look for array mutation patterns
      if (content.includes('.push') || content.includes('.pop') || content.includes('.splice')) {
        if (content.includes('const ') && content.includes(' = ')) {
          findings.push(this.createFinding(
            context,
            file.path,
            1,
            'Array mutation - use [...arr] spread instead',
            'array.push/splice/pop'
          ));
        }
      }
    }

    return findings;
  }
}

class ForKeyRule extends BaseRule {
  id = 'SOLID_FOR_KEY';
  name = 'For loop without key';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['solidjs'];
  recommendation = SOLID_FOR_KEY;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'solidjs') return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx')) continue;

      const content = file.content;

      // Check for For without key prop
      if (content.includes('<For') && !content.includes('key=') && !content.includes('each:')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'For component without key - add key function',
          '<For each={...}>'
        ));
      }
    }

    return findings;
  }
}

export class SolidjsRules {
  static getRules() {
    return [
      new ReactivityWrongRule(),
      new ArrayMutationRule(),
      new ForKeyRule()
    ];
  }
}
