import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const TS_ANY_USAGE: Recommendation = {
  title: 'Avoid using `any` type',
  description: 'Using `any` defeats TypeScript type safety. Use specific types or `unknown` if truly dynamic.',
  library: 'TypeScript'
};

const TS_IMPLICIT_ANY: Recommendation = {
  title: 'Add type annotation for implicit any',
  description: 'Function parameters without type annotations default to `any`. Add explicit types.',
  library: 'TypeScript'
};

const TS_OPTIONAL_CHAIN: Recommendation = {
  title: 'Avoid unsafe optional chaining depth',
  description: 'Deep optional chaining can be hard to reason about. Consider explicit checks.',
  library: 'TypeScript'
};

const TS_TYPE_ASSERTION: Recommendation = {
  title: 'Avoid type assertions',
  description: 'Type assertions bypass TypeScript type checking. Use proper types.',
  library: 'TypeScript'
};

const TS_ENUM_USAGE: Recommendation = {
  title: 'Avoid numeric enums',
  description: 'Numeric enums have issues. Use const objects or string enums instead.',
  library: 'TypeScript'
};

const TS_INTERFACE_MERGE: Recommendation = {
  title: 'Avoid interface merging',
  description: 'Interface merging can cause unexpected behavior. Use type aliases instead.',
  library: 'TypeScript'
};

const TS_DECORATOR_PERFORMANCE: Recommendation = {
  title: 'Consider decorator impact',
  description: 'Decorators can impact performance. Use them carefully.',
  library: 'TypeScript'
};

const TS_GENERIC_INFER: Recommendation = {
  title: 'Improve generic inference',
  description: 'Generic type inference may fail. Add explicit type parameters.',
  library: 'TypeScript'
};

class AnyUsageRule extends BaseRule {
  id = 'TS_ANY_USAGE';
  name = 'Using "any" type';
  category: Category = 'typescript';
  severity: Severity = 'medium';
  frameworks: Framework[] = [];
  recommendation = TS_ANY_USAGE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    const anyPattern = /:\s*any\b/;

    for (const file of context.files) {
      if (!file.path.endsWith('.ts') && !file.path.endsWith('.tsx')) continue;

      // Skip rule definition files to avoid self-detection
      if (file.path.includes('/rules/')) continue;

      const lines = file.content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        if (anyPattern.test(lines[i])) {
          findings.push(this.createFinding(
            context,
            file.path,
            i + 1,
            'Using "any" type - use specific type instead',
            lines[i].trim()
          ));
        }
      }
    }

    return findings;
  }
}

class ImplicitAnyRule extends BaseRule {
  id = 'TS_IMPLICIT_ANY';
  name = 'Implicit any in function params';
  category: Category = 'typescript';
  severity: Severity = 'medium';
  frameworks: Framework[] = [];
  recommendation = TS_IMPLICIT_ANY;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    // Detect function params without type annotations
    const funcPattern = /function\s+\w+\s*\(([^)]+)\)/;

    for (const file of context.files) {
      if (!file.path.endsWith('.ts') && !file.path.endsWith('.tsx')) continue;

      // Skip rule definition files to avoid self-detection
      if (file.path.includes('/rules/')) continue;

      // Skip core library files - they use explicit any for type flexibility
      if (file.path.includes('/src/core/')) continue;

      // Skip files with eslint-disable comments for any
      if (file.content.includes('eslint-disable') || file.content.includes('eslint-disable-next-line')) {
        continue;
      }

      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(funcPattern);
        if (match) {
          const params = match[1].split(',');
          for (const param of params) {
            const trimmed = param.trim();
            if (trimmed && !trimmed.includes(':') && !trimmed.startsWith('...')) {
              findings.push(this.createFinding(
                context,
                file.path,
                i + 1,
                `Implicit any parameter: ${trimmed}`,
                lines[i].trim()
              ));
            }
          }
        }
      }
    }

    return findings;
  }
}

class OptionalChainRule extends BaseRule {
  id = 'TS_OPTIONAL_CHAIN';
  name = 'Unsafe optional chaining depth';
  category: Category = 'typescript';
  severity: Severity = 'low';
  frameworks: Framework[] = [];
  recommendation = TS_OPTIONAL_CHAIN;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];
    // Check for deeply nested optional chaining like a?.b?.c?.d?.e
    for (const file of context.files) {
      const content = file.content;
      const chains = content.match(/\?.\./g) || [];
      if (chains.some(c => (c.match(/\?./g) || []).length > 2)) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Deep optional chaining detected - consider early return or object restructuring',
          'Deep optional chain'
        ));
      }
    }
    return findings;
  }
}

class TypeAssertionRule extends BaseRule {
  id = 'TS_TYPE_ASSERTION';
  name = 'Type assertion overriding TypeScript';
  category: Category = 'typescript';
  severity: Severity = 'medium';
  frameworks: Framework[] = [];
  recommendation = TS_TYPE_ASSERTION;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    for (const file of context.files) {
      if (!file.path.endsWith('.ts') && !file.path.endsWith('.tsx')) continue;

      // Skip rule definition files to avoid self-detection
      if (file.path.includes('/rules/')) continue;

      const content = file.content;
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip CLI option definitions like .option('--name <value>')
        if (line.includes('.option(')) continue;

        // Skip import statements like: import { foo as bar }
        if (line.trimStart().startsWith('import ') && line.includes(' as ')) continue;

        // Skip type casting in type annotations like: const x = foo as Type
        // But flag actual runtime type assertions: foo as Type where it's not in a type context
        if ((line.includes(' as ') || line.includes(' as<')) && !line.includes(' as const')) {
          // Only flag if it's clearly a runtime type assertion (has assignment or return)
          if (line.includes('=') || line.includes('return') || line.includes('throw')) {
            findings.push(this.createFinding(
              context,
              file.path,
              i + 1,
              'Type assertion used - consider proper typing instead',
              line.trim()
            ));
          }
        }
      }
    }

    return findings;
  }
}

class EnumUsageRule extends BaseRule {
  id = 'TS_ENUM_USAGE';
  name = 'Numeric enum usage';
  category: Category = 'typescript';
  severity: Severity = 'low';
  frameworks: Framework[] = [];
  recommendation = TS_ENUM_USAGE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    for (const file of context.files) {
      if (!file.path.endsWith('.ts') && !file.path.endsWith('.tsx')) continue;

      const content = file.content;

      if (content.includes('enum ') && !content.includes('const enum')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Numeric enum detected - consider const object or string enum',
          'enum usage'
        ));
      }
    }

    return findings;
  }
}

class InterfaceMergeRule extends BaseRule {
  id = 'TS_INTERFACE_MERGE';
  name = 'Interface merging';
  category: Category = 'typescript';
  severity: Severity = 'low';
  frameworks: Framework[] = [];
  recommendation = TS_INTERFACE_MERGE;

  detect(context: AnalysisContext): Finding[] {
    return [];
  }
}

class DecoratorPerformanceRule extends BaseRule {
  id = 'TS_DECORATOR_PERFORMANCE';
  name = 'Class decorator impact';
  category: Category = 'performance';
  severity: Severity = 'low';
  frameworks: Framework[] = [];
  recommendation = TS_DECORATOR_PERFORMANCE;

  detect(context: AnalysisContext): Finding[] {
    return [];
  }
}

class GenericInferRule extends BaseRule {
  id = 'TS_GENERIC_INFER';
  name = 'Failed generic inference';
  category: Category = 'typescript';
  severity: Severity = 'medium';
  frameworks: Framework[] = [];
  recommendation = TS_GENERIC_INFER;

  detect(context: AnalysisContext): Finding[] {
    return [];
  }
}

export class TypescriptRules {
  static getRules() {
    return [
      new AnyUsageRule(),
      new ImplicitAnyRule(),
      new OptionalChainRule(),
      new TypeAssertionRule(),
      new EnumUsageRule(),
      new InterfaceMergeRule(),
      new DecoratorPerformanceRule(),
      new GenericInferRule()
    ];
  }
}
