import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';
import {
  findPythonFunctionWithoutErrorHandling,
  findMutableDefaultArguments,
  findBroadExceptionHandling,
  findCeleryTaskWithoutTimeLimit,
} from '../python/python-helpers.js';

// ============================================
// Celery Rule Definitions
// ============================================

const CELERY_TIME_LIMIT: Recommendation = {
  title: 'Set task time limits',
  description: 'Configure task_time_limit to prevent tasks from running indefinitely.',
  library: 'Celery'
};

const CELERY_SERIALIZER: Recommendation = {
  title: 'Use secure task serializer',
  description: 'Never use pickle as task serializer - it\'s a security risk. Use JSON or msgpack.',
  library: 'Celery'
};

const CELERY_RETRY: Recommendation = {
  title: 'Configure task retry strategy',
  description: 'Tasks should have retry configuration for handling transient failures.',
  library: 'Celery'
};

// ============================================
// Rule Classes
// ============================================

class CeleryTaskWithoutTimeLimitRule extends BaseRule {
  id = 'CELERY_TASK_TIME_LIMIT';
  name = 'Missing task time limit';
  category: Category = 'reliability';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['celery'];
  recommendation = CELERY_TIME_LIMIT;

  analyze(context: AnalysisContext): Finding[] {
    return findCeleryTaskWithoutTimeLimit(context, {
      message: 'Task without time limit'
    });
  }
}

class CeleryFunctionNoErrorHandlingRule extends BaseRule {
  id = 'CELERY_FUNCTION_NO_ERROR_HANDLING';
  name = 'Celery task without try-except';
  category: Category = 'error-handling';
  severity: Severity = 'high';
  frameworks: Framework[] = ['celery'];
  recommendation = {
    title: 'Add error handling to Celery tasks',
    description: 'Celery tasks should have try-except blocks for proper error handling.',
    library: 'Celery'
  };

  analyze(context: AnalysisContext): Finding[] {
    return findPythonFunctionWithoutErrorHandling(context, {
      message: 'Function without error handling'
    });
  }
}

class CeleryMutableDefaultRule extends BaseRule {
  id = 'CELERY_MUTABLE_DEFAULT';
  name = 'Mutable default argument in Celery task';
  category: Category = 'maintainability';
  severity: Severity = 'high';
  frameworks: Framework[] = ['celery'];
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

class CeleryBroadExceptionRule extends BaseRule {
  id = 'CELERY_BROAD_EXCEPTION';
  name = 'Broad exception catching in Celery tasks';
  category: Category = 'error-handling';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['celery'];
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

export const celeryRules = [
  new CeleryTaskWithoutTimeLimitRule(),
  new CeleryFunctionNoErrorHandlingRule(),
  new CeleryMutableDefaultRule(),
  new CeleryBroadExceptionRule(),
];
