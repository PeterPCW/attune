import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';
import {
  findPythonFunctionWithoutErrorHandling,
  findMutableDefaultArguments,
  findBroadExceptionHandling,
  findFlaskAppAtModuleLevel,
} from '../python/python-helpers.js';

// ============================================
// Flask Rule Definitions
// ============================================

const FLASK_APP_FACTORY: Recommendation = {
  title: 'Use Flask application factory pattern',
  description: 'Use application factory pattern (create_app) to avoid circular imports and improve testability.',
  library: 'Flask'
};

const FLASK_DEBUG: Recommendation = {
  title: 'Disable debug mode in production',
  description: 'Flask debug mode allows code execution. Never enable in production.',
  library: 'Flask'
};

const FLASK_ERROR_HANDLER: Recommendation = {
  title: 'Add custom error handlers',
  description: 'Configure error handlers for common HTTP errors to improve user experience.',
  library: 'Flask'
};

// ============================================
// Rule Classes
// ============================================

class FlaskAppAtModuleLevelRule extends BaseRule {
  id = 'FLASK_APP_FACTORY_PATTERN';
  name = 'Flask app created at module level without factory pattern';
  category: Category = 'architecture';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['flask'];
  recommendation = FLASK_APP_FACTORY;

  analyze(context: AnalysisContext): Finding[] {
    return findFlaskAppAtModuleLevel(context, {
      message: 'Flask app at module level'
    });
  }
}

class FlaskFunctionNoErrorHandlingRule extends BaseRule {
  id = 'FLASK_FUNCTION_NO_ERROR_HANDLING';
  name = 'Flask route without try-except';
  category: Category = 'error-handling';
  severity: Severity = 'high';
  frameworks: Framework[] = ['flask'];
  recommendation = {
    title: 'Add error handling to Flask routes',
    description: 'Flask routes performing I/O should have try-except blocks.',
    library: 'Flask'
  };

  analyze(context: AnalysisContext): Finding[] {
    return findPythonFunctionWithoutErrorHandling(context, {
      message: 'Function without error handling'
    });
  }
}

class FlaskMutableDefaultRule extends BaseRule {
  id = 'FLASK_MUTABLE_DEFAULT';
  name = 'Mutable default argument in Flask route';
  category: Category = 'maintainability';
  severity: Severity = 'high';
  frameworks: Framework[] = ['flask'];
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

class FlaskBroadExceptionRule extends BaseRule {
  id = 'FLASK_BROAD_EXCEPTION';
  name = 'Broad exception catching in Flask routes';
  category: Category = 'error-handling';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['flask'];
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

export const flaskRules = [
  new FlaskAppAtModuleLevelRule(),
  new FlaskFunctionNoErrorHandlingRule(),
  new FlaskMutableDefaultRule(),
  new FlaskBroadExceptionRule(),
];
