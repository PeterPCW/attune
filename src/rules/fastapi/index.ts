import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';
import {
  findPythonFunctionWithoutErrorHandling,
  findMutableDefaultArguments,
  findBroadExceptionHandling,
  findFastAPISyncDbInAsync,
  findFastAPIMissingResponseModel,
} from '../python/python-helpers.js';

// ============================================
// FastAPI Rule Definitions
// ============================================

const FASTAPI_SYNC_DB: Recommendation = {
  title: 'Use async database operations',
  description: 'Database operations in async handlers should be async to avoid blocking the event loop.',
  library: 'FastAPI'
};

const FASTAPI_RESPONSE_MODEL: Recommendation = {
  title: 'Add response_model to endpoint',
  description: 'Define response_model for endpoints to document the response schema in OpenAPI.',
  library: 'FastAPI, Pydantic'
};

const FASTAPI_ERROR_HANDLER: Recommendation = {
  title: 'Add exception handlers',
  description: 'Configure exception handlers to return consistent, well-documented error responses.',
  library: 'FastAPI'
};

// ============================================
// Rule Classes
// ============================================

class FastAPISyncDbInAsyncRule extends BaseRule {
  id = 'FASTAPI_SYNC_DB_HANDLER';
  name = 'Synchronous database operations in async handler';
  category: Category = 'architecture';
  severity: Severity = 'high';
  frameworks: Framework[] = ['fastapi'];
  recommendation = FASTAPI_SYNC_DB;

  analyze(context: AnalysisContext): Finding[] {
    return findFastAPISyncDbInAsync(context, {
      message: 'Sync DB in async handler'
    });
  }
}

class FastAPIMissingResponseModelRule extends BaseRule {
  id = 'FASTAPI_MISSING_RESPONSE_MODEL';
  name = 'Missing response model on endpoint';
  category: Category = 'api';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['fastapi'];
  recommendation = FASTAPI_RESPONSE_MODEL;

  analyze(context: AnalysisContext): Finding[] {
    return findFastAPIMissingResponseModel(context, {
      message: 'Missing response model'
    });
  }
}

class FastAPIFunctionNoErrorHandlingRule extends BaseRule {
  id = 'FASTAPI_FUNCTION_NO_ERROR_HANDLING';
  name = 'FastAPI endpoint without try-except';
  category: Category = 'error-handling';
  severity: Severity = 'high';
  frameworks: Framework[] = ['fastapi'];
  recommendation = {
    title: 'Add error handling to FastAPI endpoints',
    description: 'FastAPI endpoints performing I/O should have try-except blocks.',
    library: 'FastAPI'
  };

  analyze(context: AnalysisContext): Finding[] {
    return findPythonFunctionWithoutErrorHandling(context, {
      message: 'Function without error handling'
    });
  }
}

class FastAPIMutableDefaultRule extends BaseRule {
  id = 'FASTAPI_MUTABLE_DEFAULT';
  name = 'Mutable default argument in FastAPI endpoint';
  category: Category = 'maintainability';
  severity: Severity = 'high';
  frameworks: Framework[] = ['fastapi'];
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

class FastAPIBroadExceptionRule extends BaseRule {
  id = 'FASTAPI_BROAD_EXCEPTION';
  name = 'Broad exception catching in FastAPI endpoints';
  category: Category = 'error-handling';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['fastapi'];
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

export const fastapiRules = [
  new FastAPISyncDbInAsyncRule(),
  new FastAPIMissingResponseModelRule(),
  new FastAPIFunctionNoErrorHandlingRule(),
  new FastAPIMutableDefaultRule(),
  new FastAPIBroadExceptionRule(),
];
