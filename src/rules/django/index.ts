import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';
import {
  findPythonFunctionWithoutErrorHandling,
  findMutableDefaultArguments,
  findBroadExceptionHandling,
  findDjangoNPlusOne,
  findDjangoMissingTransaction,
} from '../python/python-helpers.js';

// ============================================
// Django Rule Definitions
// ============================================

const DJANGO_N_PLUS_ONE: Recommendation = {
  title: 'Fix N+1 query problem',
  description: 'N+1 queries occur when fetching related objects in a loop. Use select_related() or prefetch_related().',
  library: 'Django ORM'
};

const DJANGO_MISSING_TRANSACTION: Recommendation = {
  title: 'Use transaction.atomic() for multi-db operations',
  description: 'Multiple database operations should be wrapped in transaction.atomic() for data integrity.',
  library: 'Django'
};

const DJANGO_SYNC_IN_ASYNC: Recommendation = {
  title: 'Avoid sync DB operations in async views',
  description: 'Use async DB clients or run sync operations in executor to avoid blocking event loop.',
  library: 'Django'
};

const DJANGO_DEBUG_TRUE: Recommendation = {
  title: 'Disable DEBUG in production',
  description: 'DEBUG=True exposes sensitive information. Always use DEBUG=False in production.',
  library: 'Django'
};

const DJANGO_SECRET_KEY: Recommendation = {
  title: 'Move SECRET_KEY to environment variables',
  description: 'SECRET_KEY should not be hardcoded. Use environment variables or secrets manager.',
  library: 'Django'
};

// ============================================
// Rule Classes
// ============================================

class DjangoNPlusOneRule extends BaseRule {
  id = 'DJANGO_N_PLUS_ONE';
  name = 'N+1 query problem in Django';
  category: Category = 'performance';
  severity: Severity = 'high';
  frameworks: Framework[] = ['django'];
  recommendation = DJANGO_N_PLUS_ONE;

  analyze(context: AnalysisContext): Finding[] {
    return findDjangoNPlusOne(context, {
      message: 'N+1 query detected'
    });
  }
}

class DjangoMissingTransactionRule extends BaseRule {
  id = 'DJANGO_MISSING_TRANSACTION';
  name = 'Missing transaction.atomic for multi-db operations';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['django'];
  recommendation = DJANGO_MISSING_TRANSACTION;

  analyze(context: AnalysisContext): Finding[] {
    return findDjangoMissingTransaction(context, {
      message: 'Multiple DB operations without transaction'
    });
  }
}

class DjangoFunctionNoErrorHandlingRule extends BaseRule {
  id = 'DJANGO_FUNCTION_NO_ERROR_HANDLING';
  name = 'Django view without try-except';
  category: Category = 'error-handling';
  severity: Severity = 'high';
  frameworks: Framework[] = ['django'];
  recommendation = {
    title: 'Add error handling to Django views',
    description: 'Django views performing I/O should have try-except blocks.',
    library: 'Django'
  };

  analyze(context: AnalysisContext): Finding[] {
    return findPythonFunctionWithoutErrorHandling(context, {
      message: 'Function without error handling',
      skipPaths: ['migrations', 'tests', '__pycache__', 'venv', 'env']
    });
  }
}

class DjangoMutableDefaultRule extends BaseRule {
  id = 'DJANGO_MUTABLE_DEFAULT';
  name = 'Mutable default argument in Django view';
  category: Category = 'maintainability';
  severity: Severity = 'high';
  frameworks: Framework[] = ['django'];
  recommendation = {
    title: 'Avoid mutable default arguments',
    description: 'Mutable defaults persist across calls. Use None and initialize inside function.',
    library: 'Python'
  };

  analyze(context: AnalysisContext): Finding[] {
    return findMutableDefaultArguments(context, {
      message: 'Mutable default argument'
    });
  }
}

class DjangoBroadExceptionRule extends BaseRule {
  id = 'DJANGO_BROAD_EXCEPTION';
  name = 'Broad exception catching in Django views';
  category: Category = 'error-handling';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['django'];
  recommendation = {
    title: 'Catch specific exceptions',
    description: 'Catch specific exceptions rather than broad Exception or BaseException.',
    library: 'Python'
  };

  analyze(context: AnalysisContext): Finding[] {
    return findBroadExceptionHandling(context, {
      message: 'Broad exception catch'
    });
  }
}

// ============================================
// Export Rules
// ============================================

export const djangoRules = [
  new DjangoNPlusOneRule(),
  new DjangoMissingTransactionRule(),
  new DjangoFunctionNoErrorHandlingRule(),
  new DjangoMutableDefaultRule(),
  new DjangoBroadExceptionRule(),
];

/**
 * Get rules for Django framework (for compatibility)
 */
export function getRules() {
  return djangoRules;
}
