import { Finding, AnalysisContext, SourceFile } from '../../types/index.js';

// ============================================
// Python AST-Based Helper Types
// ============================================

export interface PythonHelperParams {
  message: string;
  fileExtensions?: string[];
  skipPaths?: string[];
  maxFindings?: number;
}

// ============================================
// Python Function Detection
// ============================================

interface PythonFunction {
  name: string;
  startLine: number;
  endLine: number;
  isAsync: boolean;
  isMethod: boolean;
  decorators: string[];
}

/**
 * Find all Python function definitions in content
 */
function findPythonFunctions(content: string): PythonFunction[] {
  const functions: PythonFunction[] = [];
  const lines = content.split('\n');

  // Function definition patterns
  const functionPatterns = [
    // async def function_name(
    /^(async\s+)?def\s+(\w+)\s*\([^)]*\)\s*:/gm,
    // async def function_name(self,
    /^(async\s+)?def\s+(\w+)\s*\(([^)]*self[^)]*)\s*:/gm,
  ];

  // Track decorator lines above functions
  const decoratorMap = new Map<number, string[]>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for decorators (lines starting with @ that aren't in strings)
    if (trimmed.startsWith('@') && !trimmed.includes('#')) {
      // Store at current line index (will be looked up by 1-based line number)
      const linesBefore = decoratorMap.get(i) || [];
      linesBefore.push(trimmed);
      decoratorMap.set(i, linesBefore);
    }
  }

  // Reset regex state
  let match;
  const combinedPattern = /(?:^(async\s+)?def\s+(\w+)\s*\([^)]*\)\s*:)/gm;

  while ((match = combinedPattern.exec(content)) !== null) {
    const startIndex = match.index;
    const startLine = content.substring(0, startIndex).split('\n').length;
    const isAsync = !!match[1];
    const funcName = match[2];
    const isMethod = content.substring(0, startIndex).includes('def ') &&
                     (content.substring(0, startIndex).match(/\bself\b/) !== null ||
                      content.substring(0, startIndex).match(/\bcls\b/) !== null);

    // Get decorators for this function (decorator is on line before function)
    const decorators = decoratorMap.get(startLine - 2) || [];

    // Find the end of the function (dedent or next def/class at same/lower indent)
    const startLineContent = lines[startLine - 1];
    const baseIndent = startLineContent.match(/^(\s*)/)?.[1].length || 0;

    let endLine = startLine;
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      if (i === startLine - 1) continue;

      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue;

      const lineIndent = line.match(/^(\s*)/)?.[1].length || 0;

      // If we find a def/class at same or lower indent, we're done
      if ((trimmed.startsWith('def ') || trimmed.startsWith('class ') || trimmed.startsWith('async def ')) &&
          lineIndent <= baseIndent) {
        endLine = i;
        break;
      }

      endLine = i;
    }

    functions.push({
      name: funcName,
      startLine,
      endLine,
      isAsync,
      isMethod,
      decorators
    });
  }

  return functions;
}

// ============================================
// Find Functions Without Error Handling
// ============================================

/**
 * Find Python functions without try-except blocks
 * Only flags functions that perform I/O operations
 */
export function findPythonFunctionWithoutErrorHandling(
  context: AnalysisContext,
  params: PythonHelperParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, skipPaths = [] } = params;

  // Patterns that indicate I/O or operations needing error handling
  const ioPatterns = [
    /\bopen\s*\(/,                    // file operations
    /\brequests\./,                   // HTTP calls
    /\bhttpx\./,                     // HTTP calls
    /\b(SELECT|INSERT|UPDATE|DELETE)\b/i,  // SQL operations
    /\bCursor\b/,                     // DB cursor
    /\bconnect\s*\(/,                // DB connections
    /\bsubprocess\./,               // subprocess
    /\bos\.system/,                   // system calls
    /\bos\.popen/,                   // popen
    /\bwebsocket\.connect/,           // websockets
    /\basync\s+def/,                 // async functions often do I/O
    /\bawait\s+/,                    // await = async I/O
  ];

  const hasIO = (body: string): boolean => {
    return ioPatterns.some(pattern => pattern.test(body));
  };

  for (const file of context.files) {
    // Skip files matching skipPaths
    if (skipPaths.length > 0 && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    // Only check Python files
    if (!file.path.endsWith('.py')) {
      continue;
    }

    const content = file.content;
    const lines = content.split('\n');

    const functions = findPythonFunctions(content);

    for (const fn of functions) {
      const functionBody = lines.slice(fn.startLine - 1, fn.endLine).join('\n');

      // Skip private methods and dunder methods unless they do I/O
      if (fn.name.startsWith('_') && !fn.name.startsWith('__')) {
        continue;
      }

      // Only flag if function has I/O and no try-except
      const hasIOInBody = hasIO(functionBody);
      const hasTryExcept = /try\s*:|except\s*(\(\w+\))?:/.test(functionBody);

      if (hasIOInBody && !hasTryExcept) {
        findings.push({
          id: `py-fn-no-error-${file.path}-${fn.startLine}`,
          ruleId: '',
          severity: 'medium',
          category: 'error-handling',
          file: file.path,
          line: fn.startLine,
          message: `${message}: ${fn.name} performs I/O but has no try-except`,
          code: lines[fn.startLine - 1]?.trim() || ''
        });
      }
    }
  }

  return findings;
}

// ============================================
// Find Mutable Default Arguments
// ============================================

/**
 * Find functions with mutable default arguments (common Python anti-pattern)
 */
export function findMutableDefaultArguments(
  context: AnalysisContext,
  params: PythonHelperParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, skipPaths = [] } = params;

  for (const file of context.files) {
    if (skipPaths.length > 0 && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    if (!file.path.endsWith('.py')) continue;

    const content = file.content;
    const lines = content.split('\n');

    // Pattern: def func(arg=[] or arg={}
    const mutablePattern = /def\s+(\w+)\s*\([^)]*(?:=\s*\[|=\s*\{)[^)]*\)/g;

    let match;
    while ((match = mutablePattern.exec(content)) !== null) {
      const funcName = match[1];
      const startIndex = match.index;
      const startLine = content.substring(0, startIndex).split('\n').length;

      // Get the full function signature to check for mutable defaults
      const line = lines[startLine - 1];
      const hasMutableDefault = /=\s*\[\s*\]|=\s*\{\s*\}/.test(line);

      if (hasMutableDefault) {
        findings.push({
          id: `py-mutable-default-${file.path}-${startLine}`,
          ruleId: '',
          severity: 'high',
          category: 'maintainability',
          file: file.path,
          line: startLine,
          message: `${message}: ${funcName} has mutable default argument`,
          code: line.trim()
        });
      }
    }
  }

  return findings;
}

// ============================================
// Find Broad Exception Catching
// ============================================

/**
 * Find except: or except Exception: without specific handling
 */
export function findBroadExceptionHandling(
  context: AnalysisContext,
  params: PythonHelperParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, skipPaths = [] } = params;

  for (const file of context.files) {
    if (skipPaths.length > 0 && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    if (!file.path.endsWith('.py')) continue;

    const content = file.content;
    const lines = content.split('\n');

    // Match bare except: or except Exception: (with or without parentheses)
    // Group 1 is for Exception variant, bare except will have no group 1 match
    const exceptPattern = /except\s*(\(\s*Exception\s*\)|Exception)?\s*:/g;

    let match;
    while ((match = exceptPattern.exec(content)) !== null) {
      const startIndex = match.index;
      const startLine = content.substring(0, startIndex).split('\n').length;

      // Check next few lines for specific handling or at least logging
      const nextLines = lines.slice(startLine, Math.min(startLine + 5, lines.length)).join('\n');
      const hasSpecificHandling = /except\s*\(\s*\w+\s*\)|raise\s+\w+Exception|logger\.|logging\./.test(nextLines);

      // Flag broad exception handling (bare except: or except Exception:) without specific handling
      // Bare except: has no group 1, except Exception: has group 1 with Exception
      const isBareExcept = match[1] === undefined;
      const isBroadExcept = isBareExcept || (match[1] && match[1].includes('Exception'));
      if (isBroadExcept && !hasSpecificHandling) {
        findings.push({
          id: `py-broad-except-${file.path}-${startLine}`,
          ruleId: '',
          severity: 'high',
          category: 'error-handling',
          file: file.path,
          line: startLine,
          message: `${message}: broad exception catch may hide real errors`,
          code: lines[startLine - 1]?.trim() || ''
        });
      }
    }
  }

  return findings;
}

// ============================================
// Find Django-Specific Patterns
// ============================================

/**
 * Find Django N+1 query patterns
 * More strict: requires capitalized Model names and skips migrations/generated code
 */
export function findDjangoNPlusOne(
  context: AnalysisContext,
  params: PythonHelperParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, skipPaths = [], maxFindings = 50 } = params;

  // Default skip paths for Django projects
  const defaultSkipPaths = [
    'migrations',
    '__pycache__',
    'venv',
    '.venv',
    'env',
    'node_modules',
    'tests',
    'test_',
    '_test.',
    'conftest',
    'settings.py',
    'urls.py',
    'wsgi.py',
    '__init__.py'
  ];

  const allSkipPaths = [...defaultSkipPaths, ...skipPaths];

  for (const file of context.files) {
    if (allSkipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    if (!file.path.endsWith('.py')) continue;
    if (findings.length >= maxFindings) break;

    const content = file.content;
    const lines = content.split('\n');

    // Find Django N+1 by looking for:
    // 1. A for loop iterating over a variable assigned from a capitalized Model.objects.all/filter/get
    // 2. Inside loop, accessing a relationship (.field.field)

    // Only match capitalized Model names (Django convention): User.objects.all(), QuerySet.objects.filter()
    // This avoids matching lowercase variables that happen to have .objects method
    const querysetAssignPattern = /(\w+)\s*=\s+([A-Z]\w*)\.objects\.(all|filter|get)\(/g;
    const querysetVars = new Map<string, string>(); // varName -> modelName

    let match;
    while ((match = querysetAssignPattern.exec(content)) !== null) {
      querysetVars.set(match[1], match[2]);
    }

    // Now find for loops and check if they iterate over queryset variables
    const forLoopPattern = /for\s+(\w+)\s+in\s+(\w+)(?!\s*=)/g;

    while ((match = forLoopPattern.exec(content)) !== null) {
      if (findings.length >= maxFindings) break;

      const loopVar = match[1];
      const iterVar = match[2];
      const startIndex = match.index;
      const startLine = content.substring(0, startIndex).split('\n').length;

      // Check if iterating over a queryset variable (must be assigned from capitalized Model)
      if (querysetVars.has(iterVar)) {
        // Look for relationship access in the loop: var.field.field (not method calls)
        // Find the end of the for statement line (the newline after the colon)
        const forLineEnd = content.indexOf('\n', startIndex + match[0].length);
        if (forLineEnd === -1) continue;

        // Loop body is everything after the for statement until we hit another statement at the same indentation level
        const loopBodyStart = forLineEnd + 1;

        // Find next line that's not indented (same or less indentation than 'for' line)
        const forIndentMatch = content.substring(0, startIndex).match(/(\n|^)[ \t]*/);
        const forIndent = forIndentMatch ? forIndentMatch[0].length : 0;

        let loopBodyEnd = content.length;
        // Look for a line at same or lower indentation, or a def/class at any indentation
        for (let i = loopBodyStart; i < content.length; i++) {
          if (content[i] === '\n') {
            const nextLineStart = i + 1;
            const nextLineIndent = content.substring(nextLineStart).match(/^[ \t]*/)?.[0].length ?? 0;
            if (nextLineIndent <= forIndent || content.substring(nextLineStart).match(/^(def |class |async def )/)) {
              loopBodyEnd = i;
              break;
            }
          }
        }

        const loopBody = content.substring(loopBodyStart, loopBodyEnd);

        // Only match attribute access (.), not method calls (var.method())
        // Use simple pattern: look for var.word.word that's NOT followed by (
        const relationshipAccessPattern = new RegExp(`${loopVar}\\.\\w+\\.\\w+\\b(?!\\()`);

        if (relationshipAccessPattern.test(loopBody)) {
          // Check if select_related or prefetch_related is used (in preceding code or on queryset)
          const preContext = content.substring(Math.max(0, startIndex - 300), startIndex + 100);
          const hasOptimization = /select_related\(|prefetch_related\(/.test(preContext);

          if (!hasOptimization) {
            findings.push({
              id: `django-n-plus-one-${file.path}-${startLine}`,
              ruleId: '',
              severity: 'high',
              category: 'performance',
              file: file.path,
              line: startLine,
              message: `${message}: N+1 query - use select_related() or prefetch_related()`,
              code: lines[startLine - 1]?.trim() || ''
            });
          }
        }
      }
    }
  }

  return findings;
}

/**
 * Find Django missing transaction.atomic
 */
export function findDjangoMissingTransaction(
  context: AnalysisContext,
  params: PythonHelperParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, skipPaths = [] } = params;

  for (const file of context.files) {
    if (skipPaths.length > 0 && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    if (!file.path.endsWith('.py')) continue;

    const content = file.content;
    const lines = content.split('\n');

    // Find functions with multiple DB operations
    const functions = findPythonFunctions(content);

    for (const fn of functions) {
      const functionBody = lines.slice(fn.startLine - 1, fn.endLine).join('\n');

      // Count DB operations
      const dbOperations = (functionBody.match(/\.objects\.(create|update|delete|get|filter)/g) || []).length;

      if (dbOperations >= 2) {
        const hasTransaction = /transaction\.atomic|@transaction\.atomic|with\s+transaction/.test(functionBody);

        if (!hasTransaction) {
          findings.push({
            id: `django-no-transaction-${file.path}-${fn.startLine}`,
            ruleId: '',
            severity: 'high',
            category: 'architecture',
            file: file.path,
            line: fn.startLine,
            message: `${message}: multiple DB operations without transaction.atomic()`,
            code: lines[fn.startLine - 1]?.trim() || ''
          });
        }
      }
    }
  }

  return findings;
}

// ============================================
// Find FastAPI-Specific Patterns
// ============================================

/**
 * Find FastAPI sync DB operations in async handlers
 */
export function findFastAPISyncDbInAsync(
  context: AnalysisContext,
  params: PythonHelperParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, skipPaths = [] } = params;

  for (const file of context.files) {
    if (skipPaths.length > 0 && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    if (!file.path.endsWith('.py')) continue;

    const content = file.content;
    const lines = content.split('\n');

    const functions = findPythonFunctions(content);

    for (const fn of functions) {
      // Check if it's a FastAPI route (has route decorator)
      const hasRouteDecorator = fn.decorators.some(d =>
        d.includes('@app.get') || d.includes('@app.post') ||
        d.includes('@router.get') || d.includes('@router.post') ||
        d.includes('@app.put') || d.includes('@app.delete') ||
        d.includes('@app.patch')
      );

      if (!hasRouteDecorator) continue;

      const functionBody = lines.slice(fn.startLine - 1, fn.endLine).join('\n');

      // Check for sync DB operations in async function
      const hasSyncDb = /\b(cursor|connection|execute|fetch|query)\s*\(/.test(functionBody) &&
                        !/async\s+def/.test(functionBody.substring(0, functionBody.indexOf('def ')));

      // Actually check if the function is async
      const isAsync = fn.isAsync || /async\s+def\s+/.test(lines[fn.startLine - 1] || '');

      if (isAsync) {
        // Check for sync operations like requests, sync sqlalchemy, etc.
        const hasBlockingOps = /\brequests\./.test(functionBody) ||
                              /\bcursor\.execute/.test(functionBody) ||
                              /\bconnection\.cursor/.test(functionBody);

        if (hasBlockingOps) {
          findings.push({
            id: `fastapi-sync-db-${file.path}-${fn.startLine}`,
            ruleId: '',
            severity: 'high',
            category: 'performance',
            file: file.path,
            line: fn.startLine,
            message: `${message}: sync DB operations in async handler block event loop`,
            code: lines[fn.startLine - 1]?.trim() || ''
          });
        }
      }
    }
  }

  return findings;
}

/**
 * Find FastAPI missing response model
 */
export function findFastAPIMissingResponseModel(
  context: AnalysisContext,
  params: PythonHelperParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, skipPaths = [] } = params;

  for (const file of context.files) {
    if (skipPaths.length > 0 && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    if (!file.path.endsWith('.py')) continue;

    const content = file.content;
    const lines = content.split('\n');

    const functions = findPythonFunctions(content);

    for (const fn of functions) {
      const hasRouteDecorator = fn.decorators.some(d =>
        d.includes('@app.get') || d.includes('@app.post') ||
        d.includes('@router.get') || d.includes('@router.post')
      );

      if (!hasRouteDecorator) continue;

      // Get decorator line
      const decoratorLine = lines[fn.startLine - 2] || '';

      // Check if response_model is in the decorator
      const hasResponseModel = /response_model\s*=/.test(decoratorLine);

      if (!hasResponseModel && fn.name !== 'index' && fn.name !== 'health') {
        findings.push({
          id: `fastapi-no-response-model-${file.path}-${fn.startLine}`,
          ruleId: '',
          severity: 'medium',
          category: 'api',
          file: file.path,
          line: fn.startLine,
          message: `${message}: endpoint without response_model - add Pydantic model for docs`,
          code: lines[fn.startLine - 1]?.trim() || ''
        });
      }
    }
  }

  return findings;
}

// ============================================
// Find Flask-Specific Patterns
// ============================================

/**
 * Find Flask app created at module level (not using factory pattern)
 */
export function findFlaskAppAtModuleLevel(
  context: AnalysisContext,
  params: PythonHelperParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, skipPaths = [] } = params;

  for (const file of context.files) {
    if (skipPaths.length > 0 && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    if (!file.path.endsWith('.py')) continue;

    const content = file.content;
    const lines = content.split('\n');

    // Look for Flask app created at module level
    const appCreationPattern = /^(\w+)\s*=\s*Flask\s*\(/gm;

    let match;
    while ((match = appCreationPattern.exec(content)) !== null) {
      const startIndex = match.index;
      const startLine = content.substring(0, startIndex).split('\n').length;

      // Check if it's inside a function (factory pattern)
      const functions = findPythonFunctions(content);
      const isAtModuleLevel = !functions.some(f => f.startLine < startLine && f.endLine > startLine);

      if (isAtModuleLevel) {
        const varName = match[1];
        // Skip if it's an attribute access like app.wsgi_app
        if (!varName.includes('.')) {
          findings.push({
            id: `flask-app-module-level-${file.path}-${startLine}`,
            ruleId: '',
            severity: 'medium',
            category: 'architecture',
            file: file.path,
            line: startLine,
            message: `${message}: Flask app at module level - use application factory pattern`,
            code: lines[startLine - 1]?.trim() || ''
          });
        }
      }
    }
  }

  return findings;
}

// ============================================
// Find SQLAlchemy-Specific Patterns
// ============================================

/**
 * Find SQLAlchemy N+1 queries
 */
export function findSQLAlchemyNPlusOne(
  context: AnalysisContext,
  params: PythonHelperParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, skipPaths = [] } = params;

  for (const file of context.files) {
    if (skipPaths.length > 0 && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    if (!file.path.endsWith('.py')) continue;

    const content = file.content;
    const lines = content.split('\n');

    // Pattern: for x in session.query(Model): x.relationship
    const nPlusOnePattern = /for\s+(\w+)\s+in\s+(\w+)\.query\(([^)]+)\)([^}]*?)\n([^}]*?)\.relationship_attr/g;

    let match;
    while ((match = nPlusOnePattern.exec(content)) !== null) {
      const startIndex = match.index;
      const startLine = content.substring(0, startIndex).split('\n').length;

      // Check for eager loading
      const hasEagerLoading = /joinedload|selectinload|subqueryload/.test(content.substring(startIndex - 200, startIndex + 500));

      if (!hasEagerLoading) {
        findings.push({
          id: `sqlalchemy-n-plus-one-${file.path}-${startLine}`,
          ruleId: '',
          severity: 'high',
          category: 'performance',
          file: file.path,
          line: startLine,
          message: `${message}: N+1 query - use joinedload() or selectinload()`,
          code: lines[startLine - 1]?.trim() || ''
        });
      }
    }
  }

  return findings;
}

// ============================================
// Find Celery-Specific Patterns
// ============================================

/**
 * Find Celery tasks without time limits
 */
export function findCeleryTaskWithoutTimeLimit(
  context: AnalysisContext,
  params: PythonHelperParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, skipPaths = [] } = params;

  for (const file of context.files) {
    if (skipPaths.length > 0 && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    if (!file.path.endsWith('.py')) continue;

    const content = file.content;
    const lines = content.split('\n');

    const functions = findPythonFunctions(content);

    for (const fn of functions) {
      // Check if it's a Celery task
      const isTask = fn.decorators.some(d =>
        d.includes('@app.task') || d.includes('@shared_task') || d.includes('.task')
      );

      if (!isTask) continue;

      // Check for time_limit or soft_time_limit
      const functionBody = lines.slice(fn.startLine - 1, fn.endLine).join('\n');
      const hasTimeLimit = /time_limit\s*=|soft_time_limit\s*=/.test(functionBody) ||
                          /time_limit\s*=|soft_time_limit\s*=/.test(fn.decorators.join('\n'));

      if (!hasTimeLimit) {
        findings.push({
          id: `celery-no-time-limit-${file.path}-${fn.startLine}`,
          ruleId: '',
          severity: 'medium',
          category: 'reliability',
          file: file.path,
          line: fn.startLine,
          message: `${message}: Celery task without time limit may run forever`,
          code: lines[fn.startLine - 1]?.trim() || ''
        });
      }
    }
  }

  return findings;
}

// ============================================
// Find Python Anti-Patterns
// ============================================

/**
 * Find using type() instead of isinstance()
 */
export function findTypeVsIsinstance(
  context: AnalysisContext,
  params: PythonHelperParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, skipPaths = [] } = params;

  for (const file of context.files) {
    if (skipPaths.length > 0 && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    if (!file.path.endsWith('.py')) continue;

    const content = file.content;
    const lines = content.split('\n');

    // Pattern: type(x) == SomeType or type(x) is SomeType
    const typePattern = /type\s*\(\s*(\w+)\s*\)\s*(==|is)\s*(\w+)/g;

    let match;
    while ((match = typePattern.exec(content)) !== null) {
      const startIndex = match.index;
      const startLine = content.substring(0, startIndex).split('\n').length;

      findings.push({
        id: `py-type-vs-isinstance-${file.path}-${startLine}`,
        ruleId: '',
        severity: 'medium',
        category: 'cleanliness',
        file: file.path,
        line: startLine,
        message: `${message}: use isinstance() instead of type() for proper subclass handling`,
        code: lines[startLine - 1]?.trim() || ''
      });
    }
  }

  return findings;
}

/**
 * Find == None comparisons (should use is None)
 */
export function findNoneComparison(
  context: AnalysisContext,
  params: PythonHelperParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, skipPaths = [] } = params;

  for (const file of context.files) {
    if (skipPaths.length > 0 && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    if (!file.path.endsWith('.py')) continue;

    const content = file.content;
    const lines = content.split('\n');

    // Pattern: == None or != None (not in strings)
    const nonePattern = /(\w+)\s*==\s*None|None\s*==\s*(\w+)|(\w+)\s*!=\s*None|None\s*!=\s*(\w+)/g;

    let match;
    while ((match = nonePattern.exec(content)) !== null) {
      const startIndex = match.index;
      const startLine = content.substring(0, startIndex).split('\n').length;

      findings.push({
        id: `py-none-comparison-${file.path}-${startLine}`,
        ruleId: '',
        severity: 'low',
        category: 'cleanliness',
        file: file.path,
        line: startLine,
        message: `${message}: use 'is None' instead of '== None'`,
        code: lines[startLine - 1]?.trim() || ''
      });
    }
  }

  return findings;
}

/**
 * Find files opened without context manager
 */
export function findFileWithoutContextManager(
  context: AnalysisContext,
  params: PythonHelperParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, skipPaths = [] } = params;

  for (const file of context.files) {
    if (skipPaths.length > 0 && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    if (!file.path.endsWith('.py')) continue;

    const content = file.content;
    const lines = content.split('\n');

    // Pattern: open(...) without 'as' (not in with statement)
    const openPattern = /^(?!.*with\s).*open\s*\([^)]+\)(?!\s+as\s)/gm;

    let match;
    while ((match = openPattern.exec(content)) !== null) {
      const startIndex = match.index;
      const startLine = content.substring(0, startIndex).split('\n').length;

      // Skip if it's actually in a with statement
      const line = lines[startLine - 1];
      const prevLine = startLine > 1 ? lines[startLine - 2] : '';

      // Check if this is part of a with statement
      const isWithStatement = line.includes('with ') ||
                              (prevLine.trim().startsWith('with ') && prevLine.trim().endsWith(':'));

      if (!isWithStatement) {
        // Double check - look for with in surrounding context
        const contextStart = Math.max(0, startLine - 3);
        const contextEnd = Math.min(lines.length, startLine + 2);
        const context = lines.slice(contextStart, contextEnd).join('\n');

        if (!context.includes('with ')) {
          findings.push({
            id: `py-file-no-context-${file.path}-${startLine}`,
            ruleId: '',
            severity: 'medium',
            category: 'cleanliness',
            file: file.path,
            line: startLine,
            message: `${message}: file opened without context manager (with statement)`,
            code: line.trim()
          });
        }
      }
    }
  }

  return findings;
}

// ============================================
// Helper Registry
// ============================================

// Cast to the expected type to satisfy the registry signature
type HelperFunction = (context: AnalysisContext, params: unknown) => Finding[];

export const pythonHelperRegistry: Record<string, HelperFunction> = {
  findPythonFunctionWithoutErrorHandling: findPythonFunctionWithoutErrorHandling as HelperFunction,
  findMutableDefaultArguments: findMutableDefaultArguments as HelperFunction,
  findBroadExceptionHandling: findBroadExceptionHandling as HelperFunction,
  findDjangoNPlusOne: findDjangoNPlusOne as HelperFunction,
  findDjangoMissingTransaction: findDjangoMissingTransaction as HelperFunction,
  findFastAPISyncDbInAsync: findFastAPISyncDbInAsync as HelperFunction,
  findFastAPIMissingResponseModel: findFastAPIMissingResponseModel as HelperFunction,
  findFlaskAppAtModuleLevel: findFlaskAppAtModuleLevel as HelperFunction,
  findSQLAlchemyNPlusOne: findSQLAlchemyNPlusOne as HelperFunction,
  findCeleryTaskWithoutTimeLimit: findCeleryTaskWithoutTimeLimit as HelperFunction,
  findTypeVsIsinstance: findTypeVsIsinstance as HelperFunction,
  findNoneComparison: findNoneComparison as HelperFunction,
  findFileWithoutContextManager: findFileWithoutContextManager as HelperFunction,
};
