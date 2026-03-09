import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const TRPC_PROCEDURE_SIDE_EFFECT: Recommendation = {
  title: 'Use mutation for side effects',
  description: 'Query procedures should be pure. Use mutation for side effects (database writes, etc.).',
  library: 'tRPC'
};

const TRPC_NO_INPUT_SCHEMA: Recommendation = {
  title: 'Add input validation schema',
  description: 'Procedures should have Zod input schemas for validation.',
  library: 'Zod'
};

const TRPC_NO_ERROR_HANDLING: Recommendation = {
  title: 'Add error handling in caller',
  description: 'When calling procedures, handle errors properly.',
  library: 'tRPC'
};

class ProcedureSideEffectRule extends BaseRule {
  id = 'TRPC_PROCEDURE_SIDE_EFFECT';
  name = 'Mutation in query procedure';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['nextjs', 'react'];
  recommendation = TRPC_PROCEDURE_SIDE_EFFECT;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['nextjs', 'react'].includes(context.framework)) return findings;

    for (const file of context.files) {
      const content = file.content;

      // Check for tRPC query procedures with mutations
      if (content.includes('publicProcedure.query') || content.includes('procedure.query')) {
        // Look for db writes inside query
        if (content.includes('.create') || content.includes('.update') || content.includes('.delete')) {
          findings.push(this.createFinding(
            context,
            file.path,
            1,
            'Database write in query procedure - use mutation instead',
            'Query with side effects'
          ));
        }
      }
    }

    return findings;
  }
}

class NoInputSchemaRule extends BaseRule {
  id = 'TRPC_NO_INPUT_SCHEMA';
  name: string = 'Procedure without input schema';
  category: Category = 'security';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['nextjs', 'react'];
  recommendation = TRPC_NO_INPUT_SCHEMA;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['nextjs', 'react'].includes(context.framework)) return findings;

    for (const file of context.files) {
      const content = file.content;

      // Check for procedures without input
      if (content.includes('publicProcedure.') || content.includes('procedure.')) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('.query(') || lines[i].includes('.mutation(')) {
            // Look for input in nearby lines
            const nearby = lines.slice(Math.max(0, i - 3), i + 5).join('\n');
            if (!nearby.includes('.input(') && !nearby.includes('z.')) {
              findings.push(this.createFinding(
                context,
                file.path,
                i + 1,
                'Procedure without input schema - add Zod validation',
                'No .input() call'
              ));
            }
          }
        }
      }
    }

    return findings;
  }
}

class NoErrorHandlingRule extends BaseRule {
  id = 'TRPC_NO_ERROR_HANDLING';
  name = 'No error handling in caller';
  category: Category = 'reliability';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['nextjs', 'react'];
  recommendation = TRPC_NO_ERROR_HANDLING;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (!['nextjs', 'react'].includes(context.framework)) return findings;

    for (const file of context.files) {
      const content = file.content;

      // Check for trpc caller without error handling
      if (content.includes('trpc.') && content.includes('.useQuery')) {
        if (!content.includes('error') && !content.includes('catch') && !content.includes('onError')) {
          findings.push(this.createFinding(
            context,
            file.path,
            1,
            'tRPC query without error handling - add error state',
            'No error handling'
          ));
        }
      }
    }

    return findings;
  }
}

export class TrpcRules {
  static getRules() {
    return [
      new ProcedureSideEffectRule(),
      new NoInputSchemaRule(),
      new NoErrorHandlingRule()
    ];
  }
}
