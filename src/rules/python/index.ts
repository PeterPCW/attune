import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';
import {
  findPythonFunctionWithoutErrorHandling,
  findMutableDefaultArguments,
  findBroadExceptionHandling,
  findTypeVsIsinstance,
  findNoneComparison,
  findFileWithoutContextManager,
} from './python-helpers.js';

// ============================================
// Python Anti-Patterns Rule Definitions
// ============================================

const PYTHON_MUTABLE_DEFAULT: Recommendation = {
  title: 'Avoid mutable default arguments',
  description: 'Mutable default arguments persist across calls. Use None and initialize inside function.',
  library: 'Python'
};

const PYTHON_BROAD_EXCEPTION: Recommendation = {
  title: 'Catch specific exceptions',
  description: 'Catch specific exceptions rather than broad Exception or BaseException.',
  library: 'Python'
};

const PYTHON_TYPE_VS_ISINSTANCE: Recommendation = {
  title: 'Use isinstance() for type checking',
  description: 'Use isinstance() instead of type() to properly handle subclasses.',
  library: 'Python'
};

const PYTHON_NONE_COMPARISON: Recommendation = {
  title: 'Use "is None" for None comparison',
  description: 'Use "is None" instead of "== None" for identity comparison.',
  library: 'Python'
};

const PYTHON_FILE_CONTEXT: Recommendation = {
  title: 'Use context manager for files',
  description: 'Use "with" statement to automatically close files.',
  library: 'Python'
};

// ============================================
// Rule Classes
// ============================================

class PythonMutableDefaultRule extends BaseRule {
  id = 'PYTHON_MUTABLE_DEFAULT_ARG';
  name = 'Mutable default argument in function';
  category: Category = 'maintainability';
  severity: Severity = 'high';
  frameworks: Framework[] = ['python'];
  recommendation = PYTHON_MUTABLE_DEFAULT;

  analyze(context: AnalysisContext): Finding[] {
    return findMutableDefaultArguments(context, {
      message: 'Mutable default argument detected'
    });
  }
}

class PythonBroadExceptionRule extends BaseRule {
  id = 'PYTHON_BROAD_EXCEPTION';
  name = 'Catching overly broad exception';
  category: Category = 'error-handling';
  severity: Severity = 'high';
  frameworks: Framework[] = ['python'];
  recommendation = PYTHON_BROAD_EXCEPTION;

  analyze(context: AnalysisContext): Finding[] {
    return findBroadExceptionHandling(context, {
      message: 'Broad exception catch'
    });
  }
}

class PythonTypeVsIsinstanceRule extends BaseRule {
  id = 'PYTHON_TYPE_VS_ISINSTANCE';
  name = 'Using type() instead of isinstance()';
  category: Category = 'cleanliness';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['python'];
  recommendation = PYTHON_TYPE_VS_ISINSTANCE;

  analyze(context: AnalysisContext): Finding[] {
    return findTypeVsIsinstance(context, {
      message: 'Using type() instead of isinstance()'
    });
  }
}

class PythonNoneComparisonRule extends BaseRule {
  id = 'PYTHON_NONE_COMPARISON';
  name = 'Incorrect None comparison';
  category: Category = 'cleanliness';
  severity: Severity = 'low';
  frameworks: Framework[] = ['python'];
  recommendation = PYTHON_NONE_COMPARISON;

  analyze(context: AnalysisContext): Finding[] {
    return findNoneComparison(context, {
      message: 'Using == None instead of is None'
    });
  }
}

class PythonFileContextManagerRule extends BaseRule {
  id = 'PYTHON_FILE_NOT_CLOSED';
  name = 'File not properly closed';
  category: Category = 'cleanliness';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['python'];
  recommendation = PYTHON_FILE_CONTEXT;

  analyze(context: AnalysisContext): Finding[] {
    return findFileWithoutContextManager(context, {
      message: 'File opened without context manager'
    });
  }
}

class PythonFunctionNoErrorHandlingRule extends BaseRule {
  id = 'PYTHON_FUNCTION_NO_ERROR_HANDLING';
  name = 'Function without error handling';
  category: Category = 'error-handling';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['python'];
  recommendation = {
    title: 'Add error handling to functions',
    description: 'Functions performing I/O should have try-except blocks.',
    library: 'Python'
  };

  analyze(context: AnalysisContext): Finding[] {
    return findPythonFunctionWithoutErrorHandling(context, {
      message: 'Function without error handling',
      skipPaths: ['migrations', 'tests', '__pycache__', 'venv', 'env', '.venv']
    });
  }
}

// ============================================
// Export Rules
// ============================================

export const pythonRules = [
  new PythonMutableDefaultRule(),
  new PythonBroadExceptionRule(),
  new PythonTypeVsIsinstanceRule(),
  new PythonNoneComparisonRule(),
  new PythonFileContextManagerRule(),
  new PythonFunctionNoErrorHandlingRule(),
];
