import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const REACT_MISSING_DEPS: Recommendation = {
  title: 'Add exhaustive deps to useEffect',
  description: 'useEffect missing dependencies in deps array. This can cause stale closures.',
  library: 'React'
};

const REACT_INFINITE_LOOP: Recommendation = {
  title: 'Fix infinite loop in useEffect',
  description: 'useEffect with empty deps array that updates state can cause infinite loop.',
  library: 'React'
};

const REACT_HOOK_RULE_VIOLATION: Recommendation = {
  title: 'Move hooks outside conditionals',
  description: 'React hooks must be called unconditionally at the top level of a component.',
  library: 'React'
};

const REACT_MISSING_KEY: Recommendation = {
  title: 'Add key prop to list items',
  description: 'Missing key prop in list rendering. Keys help React identify changed items.',
  library: 'React'
};

const REACT_STALE_CLOSURE: Recommendation = {
  title: 'Add proper dependencies to useCallback',
  description: 'useCallback without proper dependencies can lead to stale closures.',
  library: 'React'
};

const REACT_UNNECESSARY_RERENDER: Recommendation = {
  title: 'Use useMemo for expensive computations',
  description: 'Non-reactive values computed in render cause unnecessary re-renders.',
  library: 'React'
};

const REACT_IMPURE_COMPONENT: Recommendation = {
  title: 'Remove random values from render',
  description: 'Components with random values in render cause unnecessary re-renders and break reconciliation.',
  library: 'React'
};

const REACT_DUPLICATE_KEY: Recommendation = {
  title: 'Fix duplicate keys in lists',
  description: 'Duplicate keys cause incorrect rendering and reconciliation issues.',
  library: 'React'
};

const REACT_SHOULD_COMPONENT_UPDATE: Recommendation = {
  title: 'Use React.memo instead of shouldComponentUpdate',
  description: 'shouldComponentUpdate is deprecated. Use React.memo for function components.',
  library: 'React'
};

const REACT_DIRECT_MANIPULATION: Recommendation = {
  title: 'Avoid direct DOM manipulation',
  description: 'Direct DOM manipulation bypasses React reconciliation. Use refs sparingly.',
  library: 'React'
};

const REACT_CONTEXT_REWRITE: Recommendation = {
  title: 'Don\'t mutate context value',
  description: 'Mutating context value directly breaks reactivity. Use setState.',
  library: 'React'
};

const REACT_FORWARD_REF_LEAK: Recommendation = {
  title: 'Use useImperativeHandle with forwardRef',
  description: 'forwardRef without useImperativeHandle can leak implementation details.',
  library: 'React'
};

const REACT_ASYNC_IN_RENDER: Recommendation = {
  title: 'Don\'t use async functions in render',
  description: 'Async functions in render cause issues. Use useEffect for async operations.',
  library: 'React'
};

const REACT_BIND_IN_RENDER: Recommendation = {
  title: 'Don\'t bind in render',
  description: 'Binding functions in render creates new functions on each render. Use useCallback.',
  library: 'React'
};

const REACT_SETSTATE_OBJ_MUTATION: Recommendation = {
  title: 'Don\'t mutate state object',
  description: 'Mutating state directly breaks React. Always use setState with new object.',
  library: 'React'
};

class MissingDepsRule extends BaseRule {
  id = 'REACT_MISSING_DEPS';
  name = 'useEffect without exhaustive deps';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['react', 'nextjs'];
  recommendation = REACT_MISSING_DEPS;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['react', 'nextjs'].includes(context.framework)) return findings;

    const useEffectNoDeps = /useEffect\s*\(\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\}\s*,\s*(\[\]|\s*\))/;

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx') && !file.path.endsWith('.ts')) continue;

      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('useEffect') && useEffectNoDeps.test(lines[i])) {
          if (content.includes('useState') && /useEffect[\s\S]{0,200}set\w+/.test(content)) {
            findings.push(this.createFinding(
              context,
              file.path,
              i + 1,
              'useEffect with empty deps using state - missing dependencies',
              lines[i].trim()
            ));
          }
        }
      }
    }

    return findings;
  }
}

class InfiniteLoopRule extends BaseRule {
  id = 'REACT_INFINITE_LOOP';
  name = 'useEffect with empty deps + state';
  category: Category = 'architecture';
  severity: Severity = 'critical';
  frameworks: Framework[] = ['react', 'nextjs'];
  recommendation = REACT_INFINITE_LOOP;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['react', 'nextjs'].includes(context.framework)) return findings;

    const infiniteLoopPattern = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]{0,500}set\w+\s*\([^)]+\)[\s\S]*?\}\s*,\s*\[\s*\]\s*\)/;

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx') && !file.path.endsWith('.ts')) continue;

      const content = file.content;

      if (infiniteLoopPattern.test(content)) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Potential infinite loop - useEffect with empty deps calling setState',
          'useEffect with [] deps calling setState'
        ));
      }
    }

    return findings;
  }
}

class HookRuleViolation extends BaseRule {
  id = 'REACT_HOOK_RULE_VIOLATION';
  name = 'Hooks called conditionally';
  category: Category = 'architecture';
  severity: Severity = 'critical';
  frameworks: Framework[] = ['react', 'nextjs'];
  recommendation = REACT_HOOK_RULE_VIOLATION;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['react', 'nextjs'].includes(context.framework)) return findings;

    const conditionalHookPattern = /if\s*\([^)]+\)\s*\{[\s\S]*?use(Actions|State|Effect|Callback|Ref|Memo)\s*\(/;

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx') && !file.path.endsWith('.ts')) continue;

      const content = file.content;

      if (conditionalHookPattern.test(content)) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'React hooks called conditionally - must be called unconditionally',
          'Hook inside if statement'
        ));
      }
    }

    return findings;
  }
}

class MissingKeyRule extends BaseRule {
  id = 'REACT_MISSING_KEY';
  name = 'Map without keys';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['react', 'nextjs'];
  recommendation = REACT_MISSING_KEY;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['react', 'nextjs'].includes(context.framework)) return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx')) continue;

      const content = file.content;

      if (content.includes('.map(') && !content.includes('key=')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'List mapping without key prop',
          '.map() without key='
        ));
      }
    }

    return findings;
  }
}

class StaleClosureRule extends BaseRule {
  id = 'REACT_STALE_CLOSURE';
  name = 'useCallback without proper deps';
  category: Category = 'architecture';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['react', 'nextjs'];
  recommendation = REACT_STALE_CLOSURE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['react', 'nextjs'].includes(context.framework)) return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx')) continue;

      const content = file.content;

      // Look for useCallback without deps array
      if (content.includes('useCallback') && !content.includes('useCallback(')) {
        // Simplified detection
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('useCallback') && !lines[i].includes('[]')) {
            findings.push(this.createFinding(
              context,
              file.path,
              i + 1,
              'useCallback may have missing dependencies',
              lines[i].trim()
            ));
            break;
          }
        }
      }
    }

    return findings;
  }
}

class UnnecessaryRerenderRule extends BaseRule {
  id = 'REACT_UNNECESSARY_RERENDER';
  name = 'Expensive computation in render';
  category: Category = 'performance';
  severity: Severity = 'low';
  frameworks: Framework[] = ['react', 'nextjs'];
  recommendation = REACT_UNNECESSARY_RERENDER;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['react', 'nextjs'].includes(context.framework)) return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx')) continue;

      const content = file.content;

      // Look for expensive operations without useMemo
      if (content.includes('.map(') || content.includes('.filter(') || content.includes('.reduce(')) {
        if (!content.includes('useMemo')) {
          findings.push(this.createFinding(
            context,
            file.path,
            1,
            'Expensive computation without useMemo - may cause unnecessary re-renders',
            'Consider wrapping in useMemo'
          ));
          break;
        }
      }
    }

    return findings;
  }
}

class ImpureComponentRule extends BaseRule {
  id = 'REACT_IMPURE_COMPONENT';
  name = 'Component with random values';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['react', 'nextjs'];
  recommendation = REACT_IMPURE_COMPONENT;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['react', 'nextjs'].includes(context.framework)) return findings;

    const randomPatterns = [
      /Math\.random\(/,
      /Date\.now\(\)/,
      /crypto\.randomUUID\(/,
    ];

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx')) continue;

      const content = file.content;

      // Check if in component body (not outside)
      if (content.includes('function') || content.includes('=>')) {
        for (const pattern of randomPatterns) {
          if (pattern.test(content)) {
            findings.push(this.createFinding(
              context,
              file.path,
              1,
              'Random values in component may cause unnecessary re-renders',
              'Move random values outside component or use useMemo'
            ));
            break;
          }
        }
      }
    }

    return findings;
  }
}

class DuplicateKeyRule extends BaseRule {
  id = 'REACT_DUPLICATE_KEY';
  name = 'Duplicate keys in lists';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['react', 'nextjs'];
  recommendation = REACT_DUPLICATE_KEY;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['react', 'nextjs'].includes(context.framework)) return findings;

    // This would require AST analysis to detect accurately
    // For now, we skip this as it's complex to detect with regex
    return findings;
  }
}

class ShouldComponentUpdateRule extends BaseRule {
  id = 'REACT_SHOULD_COMPONENT_UPDATE';
  name = 'Legacy shouldComponentUpdate';
  category: Category = 'architecture';
  severity: Severity = 'low';
  frameworks: Framework[] = ['react', 'nextjs'];
  recommendation = REACT_SHOULD_COMPONENT_UPDATE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['react', 'nextjs'].includes(context.framework)) return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx')) continue;

      const content = file.content;

      if (content.includes('shouldComponentUpdate')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'shouldComponentUpdate is deprecated - use React.memo instead',
          'shouldComponentUpdate'
        ));
      }
    }

    return findings;
  }
}

class DirectManipulationRule extends BaseRule {
  id = 'REACT_DIRECT_MANIPULATION';
  name = 'Direct DOM manipulation';
  category: Category = 'architecture';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['react', 'nextjs'];
  recommendation = REACT_DIRECT_MANIPULATION;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['react', 'nextjs'].includes(context.framework)) return findings;

    const domPatterns = [
      /document\.getElementById/,
      /document\.querySelector/,
      /document\.body/,
      /ref\.current\.innerHTML/,
    ];

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx')) continue;

      const content = file.content;

      for (const pattern of domPatterns) {
        if (pattern.test(content)) {
          findings.push(this.createFinding(
            context,
            file.path,
            1,
            'Direct DOM manipulation bypasses React - use refs sparingly',
            content.substring(0, 100)
          ));
          break;
        }
      }
    }

    return findings;
  }
}

class ContextRewriteRule extends BaseRule {
  id = 'REACT_CONTEXT_REWRITE';
  name = 'Mutating context value';
  category: Category = 'architecture';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['react', 'nextjs'];
  recommendation = REACT_CONTEXT_REWRITE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['react', 'nextjs'].includes(context.framework)) return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx')) continue;

      const content = file.content;

      // Look for direct mutation of context
      if (content.includes('Context') && content.includes('=') && !content.includes('useState')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Direct context value mutation - use setState instead',
          'Mutating context directly'
        ));
        break;
      }
    }

    return findings;
  }
}

class ForwardRefLeakRule extends BaseRule {
  id = 'REACT_FORWARD_REF_LEAK';
  name = 'forwardRef without useImperativeHandle';
  category: Category = 'architecture';
  severity: Severity = 'low';
  frameworks: Framework[] = ['react', 'nextjs'];
  recommendation = REACT_FORWARD_REF_LEAK;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['react', 'nextjs'].includes(context.framework)) return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx')) continue;

      const content = file.content;

      if (content.includes('forwardRef') && !content.includes('useImperativeHandle')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Consider using useImperativeHandle with forwardRef for better encapsulation',
          'forwardRef without useImperativeHandle'
        ));
      }
    }

    return findings;
  }
}

class AsyncInRenderRule extends BaseRule {
  id = 'REACT_ASYNC_IN_RENDER';
  name = 'Async function in render';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['react', 'nextjs'];
  recommendation = REACT_ASYNC_IN_RENDER;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['react', 'nextjs'].includes(context.framework)) return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx')) continue;

      const content = file.content;

      // Look for async directly in component
      const asyncInRender = /function\s+\w+[^{]*\{[^}]*async\s+\w+\s*\(/;

      if (asyncInRender.test(content)) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Async function in component body - use useEffect for async operations',
          'Async in render'
        ));
      }
    }

    return findings;
  }
}

class BindInRenderRule extends BaseRule {
  id = 'REACT_BIND_IN_RENDER';
  name = '.bind() in render method';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['react', 'nextjs'];
  recommendation = REACT_BIND_IN_RENDER;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['react', 'nextjs'].includes(context.framework)) return findings;

    const bindPattern = /\.bind\s*\(\s*this/;

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx')) continue;

      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        if (bindPattern.test(lines[i])) {
          findings.push(this.createFinding(
            context,
            file.path,
            i + 1,
            'Binding in render creates new function each render - use useCallback',
            lines[i].trim()
          ));
          break;
        }
      }
    }

    return findings;
  }
}

class SetStateObjMutationRule extends BaseRule {
  id = 'REACT_SETSTATE_OBJ_MUTATION';
  name = 'Mutating state object directly';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['react', 'nextjs'];
  recommendation = REACT_SETSTATE_OBJ_MUTATION;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['react', 'nextjs'].includes(context.framework)) return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx')) continue;

      const content = file.content;

      // Look for direct mutation patterns like: this.setState({...state, x: y})
      const mutationPattern = /set\w+\s*\(\s*\{[^}]*\.\.\./;

      if (mutationPattern.test(content)) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'State mutation detected - create new object instead of spreading',
          'Mutating state object'
        ));
      }
    }

    return findings;
  }
}

export class ReactRules {
  static getRules() {
    return [
      new MissingDepsRule(),
      new InfiniteLoopRule(),
      new HookRuleViolation(),
      new MissingKeyRule(),
      new StaleClosureRule(),
      new UnnecessaryRerenderRule(),
      new ImpureComponentRule(),
      new DuplicateKeyRule(),
      new ShouldComponentUpdateRule(),
      new DirectManipulationRule(),
      new ContextRewriteRule(),
      new ForwardRefLeakRule(),
      new AsyncInRenderRule(),
      new BindInRenderRule(),
      new SetStateObjMutationRule()
    ];
  }
}
