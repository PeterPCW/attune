import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';
import {
  findPythonFunctionWithoutErrorHandling,
  findMutableDefaultArguments,
  findBroadExceptionHandling,
  findSQLAlchemyNPlusOne,
} from '../python/python-helpers.js';

// ============================================
// SQLAlchemy Rule Definitions
// ============================================

const SQLA_N_PLUS_ONE: Recommendation = {
  title: 'Fix N+1 queries with eager loading',
  description: 'Use eager loading strategies (joinedload, selectinload) to prevent N+1 queries.',
  library: 'SQLAlchemy'
};

const SQLA_SESSION_COMMIT: Recommendation = {
  title: 'Explicitly commit database changes',
  description: 'Call session.commit() after making changes to persist them.',
  library: 'SQLAlchemy'
};

// ============================================
// Rule Classes
// ============================================

class SQLAlchemyNPlusOneRule extends BaseRule {
  id = 'SQLA_N_PLUS_ONE';
  name = 'N+1 query problem in SQLAlchemy';
  category: Category = 'performance';
  severity: Severity = 'high';
  frameworks: Framework[] = ['sqlalchemy'];
  recommendation = SQLA_N_PLUS_ONE;

  analyze(context: AnalysisContext): Finding[] {
    return findSQLAlchemyNPlusOne(context, {
      message: 'N+1 query detected'
    });
  }
}

class SQLAlchemyFunctionNoErrorHandlingRule extends BaseRule {
  id = 'SQLA_FUNCTION_NO_ERROR_HANDLING';
  name = 'SQLAlchemy query without try-except';
  category: Category = 'error-handling';
  severity: Severity = 'high';
  frameworks: Framework[] = ['sqlalchemy'];
  recommendation = {
    title: 'Add error handling to database operations',
    description: 'Database operations should have try-except blocks.',
    library: 'SQLAlchemy'
  };

  analyze(context: AnalysisContext): Finding[] {
    return findPythonFunctionWithoutErrorHandling(context, {
      message: 'Function without error handling'
    });
  }
}

class SQLAlchemyMutableDefaultRule extends BaseRule {
  id = 'SQLA_MUTABLE_DEFAULT';
  name = 'Mutable default argument in SQLAlchemy code';
  category: Category = 'maintainability';
  severity: Severity = 'high';
  frameworks: Framework[] = ['sqlalchemy'];
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

class SQLAlchemyBroadExceptionRule extends BaseRule {
  id = 'SQLA_BROAD_EXCEPTION';
  name = 'Broad exception catching in SQLAlchemy code';
  category: Category = 'error-handling';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['sqlalchemy'];
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

export const sqlalchemyRules = [
  new SQLAlchemyNPlusOneRule(),
  new SQLAlchemyFunctionNoErrorHandlingRule(),
  new SQLAlchemyMutableDefaultRule(),
  new SQLAlchemyBroadExceptionRule(),
];
