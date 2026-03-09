import { Finding, AnalysisContext, SourceFile } from '../../types/index.js';

// ============================================
// AST-Based Helper Types
// ============================================

export interface FindMissingAstParams {
  /** AST node type to find (e.g., 'FunctionDeclaration', 'CallExpression') */
  nodeType: string;
  /** Pattern that should exist in the file (if not found, report finding) */
  requiredPattern?: string;
  message: string;
  fileExtensions?: string[];
  skipPaths?: string[];
}

export interface FindAstPropertyParams {
  /** Property name to check */
  propertyName: string;
  /** Whether the property should exist (true) or should NOT exist (false) */
  shouldExist: boolean;
  message: string;
  nodeTypes?: string[]; // Which node types to check (default: all)
  fileExtensions?: string[];
  skipPaths?: string[];
}

export interface FindAstImportParams {
  /** Import specifier to find */
  importName: string;
  /** Whether import should exist (true) or should NOT exist (false) */
  shouldExist: boolean;
  message: string;
  fileExtensions?: string[];
  skipPaths?: string[];
}

// ============================================
// Simple AST-like helpers (without full parser)
// These use regex-based heuristics that mimic AST behavior
// For full AST support, ts-morph can be integrated
// ============================================

/**
 * Find functions without error handling (try-catch)
 * Uses pattern matching to identify function declarations and checks for error handling
 * Only flags functions that perform async operations or I/O
 */
export function findFunctionWithoutErrorHandling(
  context: AnalysisContext,
  params: { message: string; minLines?: number; skipPaths?: string[] }
): Finding[] {
  const findings: Finding[] = [];
  const { message, minLines = 8, skipPaths = [] } = params;

  // Patterns that indicate a function performs I/O or needs error handling
  const ioPatterns = [
    /async\s+/,                           // async functions
    /await\s+/,                           // await calls
    /\bfetch\s*\(/,                       // HTTP calls
    /\baxios\./,                         // axios calls
    /\bPromise\./,                       // Promise calls
    /\breadFile/,                        // file read
    /\bwriteFile/,                       // file write
    /\bopenDatabase|\bconnect\(|\bquery\(/, // database operations
    /\bexec\(|\bspawn\(/,                // subprocess execution
    /\brequire\s*\(\s*['"]fs['"]/,      // fs module usage
    /\brequire\s*\(\s*['"]http['"]/,    // http module
    /\brequire\s*\(\s*['"]https['"]/,    // https module
  ];

  // Check if function body has I/O operations
  const hasIO = (body: string): boolean => {
    return ioPatterns.some(pattern => pattern.test(body));
  };

  // Pattern to match function declarations (with optional 'async' keyword)
  const functionPatterns = [
    /async\s+function\s+(\w+)\s*\([^)]*\)\s*\{/g,           // async function name()
    /function\s+(\w+)\s*\([^)]*\)\s*\{/g,                    // function name()
    /const\s+(\w+)\s*=\s*async\s*\([^)]*\)\s*=>/g,         // const name = async () =>
    /const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g,    // const name = () =>
    /const\s+(\w+)\s*=\s*async\s+function\s*\([^)]*\)/g,     // const name = async function()
  ];

  for (const file of context.files) {
    // Skip files matching skipPaths
    if (skipPaths.length > 0 && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    // Only check JS/TS files
    if (!file.path.endsWith('.ts') && !file.path.endsWith('.js') &&
        !file.path.endsWith('.tsx') && !file.path.endsWith('.jsx')) {
      continue;
    }

    const content = file.content;
    const lines = content.split('\n');

    // Find all function definitions
    const functions: { name: string; startLine: number; endLine: number; isAsync: boolean }[] = [];

    for (const pattern of functionPatterns) {
      let match;
      // Reset lastIndex for global patterns
      const re = new RegExp(pattern.source, pattern.flags);
      while ((match = re.exec(content)) !== null) {
        const startIndex = match.index;
        const startLine = content.substring(0, startIndex).split('\n').length;

        // Check if this is an async function
        const isAsync = /async\s+function|=\s*async\s+/.test(match[0]);

        // Find the matching closing brace
        let braceCount = 0;
        let foundOpen = false;
        let endLine = startLine;

        for (let i = startIndex; i < content.length && endLine - startLine < 150; i++) {
          if (content[i] === '{') {
            braceCount++;
            foundOpen = true;
          } else if (content[i] === '}') {
            braceCount--;
            if (foundOpen && braceCount === 0) {
              endLine = content.substring(0, i).split('\n').length;
              break;
            }
          }
        }

        if (endLine - startLine >= minLines) {
          functions.push({
            name: match[1] || 'anonymous',
            startLine,
            endLine,
            isAsync
          });
        }
      }
    }

    // Check each function for try-catch, but only if it has I/O
    for (const fn of functions) {
      const functionBody = lines.slice(fn.startLine - 1, fn.endLine).join('\n');

      // Only flag if function has I/O operations AND no try-catch
      const hasIOInBody = hasIO(functionBody);
      const hasTryCatch = /try\s*\{/.test(functionBody) || /catch\s*\(/.test(functionBody);

      // Skip pure functions - they don't need error handling
      // Only flag async functions or functions with I/O that lack try-catch
      if (hasIOInBody && !hasTryCatch) {
        findings.push({
          id: `fn-no-error-${file.path}-${fn.startLine}`,
          ruleId: '',
          severity: 'medium',
          category: 'error-handling',
          file: file.path,
          line: fn.startLine,
          message: `${message}: ${fn.name} performs I/O but has no try-catch`,
          code: lines[fn.startLine - 1]?.trim() || ''
        });
      }
    }
  }

  return findings;
}

/**
 * Find React components without PropTypes or TypeScript types
 */
export function findComponentWithoutTypes(
  context: AnalysisContext,
  params: { message: string }
): Finding[] {
  const findings: Finding[] = [];
  const { message } = params;

  // Only check React files
  if (context.framework !== 'react' && context.framework !== 'nextjs') {
    return findings;
  }

  for (const file of context.files) {
    if (!file.path.endsWith('.tsx') && !file.path.endsWith('.jsx')) {
      continue;
    }

    const content = file.content;
    const lines = content.split('\n');

    // Match React component definitions
    const componentPatterns = [
      /function\s+([A-Z]\w+)\s*\(/g,                           // function Component()
      /const\s+([A-Z]\w+)\s*=\s*(?:\s*\([^)]*\)\s*=>|function)/g, // const Component = ...
      /class\s+([A-Z]\w+)\s+extends\s+(?:React\.)?Component/g,  // class Component extends
    ];

    for (const pattern of componentPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const componentName = match[1];
        const startLine = content.substring(0, match.index).split('\n').length;

        // Check if component has PropTypes or TypeScript interface
        const hasPropTypes = /PropTypes/.test(content);
        const hasTypeScript = /\s+:\s*(?:React\.)?FC|<[\w]+>/.test(content);

        // Also check for interface defined near the component
        const lineRange = Math.max(0, startLine - 5);
        const precedingLines = lines.slice(lineRange, startLine).join('\n');
        const hasInterface = /interface\s+\w+Props?\s*\{/.test(precedingLines);

        if (!hasPropTypes && !hasTypeScript && !hasInterface) {
          findings.push({
            id: `component-no-types-${file.path}-${startLine}`,
            ruleId: '',
            severity: 'medium',
            category: 'typescript',
            file: file.path,
            line: startLine,
            message: `${message}: ${componentName}`,
            code: lines[startLine - 1]?.trim() || ''
          });
        }
      }
    }
  }

  return findings;
}

/**
 * Find async functions without await or .then()
 * Only flags cases where async results are clearly not handled
 * (e.g., async IIFEs or async arrow functions assigned to variables without handling)
 */
export function findAsyncWithoutAwait(
  context: AnalysisContext,
  params: { message: string }
): Finding[] {
  const findings: Finding[] = [];
  const { message } = params;

  for (const file of context.files) {
    if (!file.path.endsWith('.ts') && !file.path.endsWith('.js') &&
        !file.path.endsWith('.tsx') && !file.path.endsWith('.jsx')) {
      continue;
    }

    const content = file.content;
    const lines = content.split('\n');

    // Only flag async IIFEs or arrow functions assigned to variables - these are likely bugs
    // Don't flag function declarations as they might be exported or used later
    const asyncPattern = /(?:const|let|var)\s+(\w+)\s*=\s*async\s*(?:\([^)]*\)|\w+)\s*=>/g;

    let match;
    while ((match = asyncPattern.exec(content)) !== null) {
      const varName = match[1];
      const startIndex = match.index;
      const startLine = content.substring(0, startIndex).split('\n').length;

      // Find the function body (up to next semicolon or line)
      const lineStart = content.indexOf('=>', startIndex);
      if (lineStart === -1) continue;

      // Look for the body start
      let bodyStart = content.indexOf('{', lineStart);
      if (bodyStart === -1) continue;

      // Find matching closing brace
      let braceCount = 1;
      let bodyEnd = bodyStart + 1;
      while (bodyEnd < content.length && braceCount > 0) {
        if (content[bodyEnd] === '{') braceCount++;
        else if (content[bodyEnd] === '}') braceCount--;
        bodyEnd++;
      }

      const functionBody = content.substring(bodyStart, bodyEnd);

      // Only flag if function body contains async operations (fetch, db, etc.) but no await/then
      const hasIO = /\bfetch\s*\(|\bPromise\b|\bawait\s+|\.then\s*\(/.test(functionBody);
      const hasAwaitOrThen = /\bawait\s+|\.then\s*\(/.test(functionBody);

      // Skip if no IO operations or if already has await/then
      if (!hasIO || hasAwaitOrThen) continue;

      findings.push({
        id: `async-no-await-${file.path}-${startLine}`,
        ruleId: '',
        severity: 'low',
        category: 'performance',
        file: file.path,
        line: startLine,
        message: `${message}: async function assigned to '${varName}' may need await handling`,
        code: lines[startLine - 1]?.trim() || ''
      });
    }
  }

  return findings;
}

/**
 * Find missing TypeScript return types on exported functions
 */
export function findMissingReturnType(
  context: AnalysisContext,
  params: { message: string }
): Finding[] {
  const findings: Finding[] = [];
  const { message } = params;

  for (const file of context.files) {
    if (!file.path.endsWith('.ts') && !file.path.endsWith('.tsx')) {
      continue;
    }

    const content = file.content;
    const lines = content.split('\n');

    // Find exported functions without return types
    const exportPatterns = [
      /export\s+function\s+(\w+)\s*\([^)]*\)\s*(?!:)/g,           // export function name()
      /export\s+const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g, // export const name = ()
    ];

    for (const pattern of exportPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const fnName = match[1];
        const startLine = content.substring(0, match.index).split('\n').length;

        // Check if return type is present (look ahead on same line)
        const line = lines[startLine - 1];
        const hasReturnType = /:\s*\w+[\[\]|<>]?\s*$|:\s*Promise\s*</.test(line);

        if (!hasReturnType) {
          findings.push({
            id: `no-return-type-${file.path}-${startLine}`,
            ruleId: '',
            severity: 'low',
            category: 'typescript',
            file: file.path,
            line: startLine,
            message: `${message}: ${fnName}`,
            code: line.trim()
          });
        }
      }
    }
  }

  return findings;
}

/**
 * Find potential memory leaks: event listeners without cleanup
 */
export function findEventListenerWithoutCleanup(
  context: AnalysisContext,
  params: { message: string }
): Finding[] {
  const findings: Finding[] = [];
  const { message } = params;

  for (const file of context.files) {
    const content = file.content;
    const lines = content.split('\n');

    // Check for useEffect in React files (most common source of memory leaks)
    if (file.path.endsWith('.tsx') || file.path.endsWith('.jsx')) {
      // Find useEffect with addEventListener
      const effectPattern = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([^}]*addEventListener[^}]*)\}/g;

      let match;
      while ((match = effectPattern.exec(content)) !== null) {
        const effectBody = match[1];
        const startLine = content.substring(0, match.index).split('\n').length;

        // Check if there's a cleanup function (return () => {})
        const hasCleanup = /return\s*\(\s*\)\s*=>\s*\{[^}]*removeEventListener/.test(effectBody);

        if (!hasCleanup) {
          findings.push({
            id: `event-leak-${file.path}-${startLine}`,
            ruleId: '',
            severity: 'high',
            category: 'performance',
            file: file.path,
            line: startLine,
            message: `${message}`,
            code: 'useEffect with addEventListener without cleanup'
          });
        }
      }
    }

    // Check for addEventListener without corresponding removeEventListener in same scope
    if (file.path.endsWith('.ts') || file.path.endsWith('.js')) {
      const addListenerPattern = /addEventListener\s*\(\s*['"](\w+)['"]/g;

      let match;
      while ((match = addListenerPattern.exec(content)) !== null) {
        const eventType = match[1];
        const startLine = content.substring(0, match.index).split('\n').length;

        // Look for removeEventListener for same event type in nearby code (within 50 lines)
        const searchStart = Math.max(0, startLine - 10);
        const searchEnd = Math.min(lines.length, startLine + 40);
        const searchArea = lines.slice(searchStart, searchEnd).join('\n');

        const hasRemove = new RegExp(`removeEventListener\\s*\\(\\s*['"]${eventType}['"]`).test(searchArea);

        if (!hasRemove) {
          findings.push({
            id: `listener-no-remove-${file.path}-${startLine}`,
            ruleId: '',
            severity: 'high',
            category: 'performance',
            file: file.path,
            line: startLine,
            message: `${message}: addEventListener('${eventType}') without removeEventListener`,
            code: lines[startLine - 1]?.trim() || ''
          });
        }
      }
    }
  }

  return findings;
}

/**
 * Find missing dependency arrays in React useEffect
 */
export function findMissingDependencyArray(
  context: AnalysisContext,
  params: { message: string }
): Finding[] {
  const findings: Finding[] = [];
  const { message } = params;

  // Only check React files
  if (context.framework !== 'react' && context.framework !== 'nextjs') {
    return findings;
  }

  for (const file of context.files) {
    if (!file.path.endsWith('.tsx') && !file.path.endsWith('.jsx')) {
      continue;
    }

    const content = file.content;
    const lines = content.split('\n');

    // Find useEffect without dependency array or with empty array
    const effectPattern = /useEffect\s*\(\s*(?:\([^)]*\)\s*=>|function[^{]*\{)([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;

    let match;
    while ((match = effectPattern.exec(content)) !== null) {
      const effectBody = match[1];
      const startLine = content.substring(0, match.index).split('\n').length;

      // Check for dependency array after the callback
      const nextChars = content.substring(match.index + match[0].length, match.index + match[0].length + 20);

      // Empty dependency array is intentional, but missing array entirely is often a bug
      // This is a heuristic - we flag when we can't find a clear dependency indicator
      const hasDeps = /\]\s*[,\)]/.test(nextChars);

      // Only flag if there's async operations or variables used
      if (!hasDeps && (/\bawait\s+|\buseState\b|\buseContext\b/.test(effectBody))) {
        findings.push({
          id: `missing-deps-${file.path}-${startLine}`,
          ruleId: '',
          severity: 'medium',
          category: 'react',
          file: file.path,
          line: startLine,
          message: `${message}`,
          code: lines[startLine - 1]?.trim() || ''
        });
      }
    }
  }

  return findings;
}

// ============================================
// AST Helper Registry
// ============================================

export const astHelperRegistry: Record<string, (context: AnalysisContext, params: unknown) => Finding[]> = {
  findFunctionWithoutErrorHandling,
  findComponentWithoutTypes,
  findAsyncWithoutAwait,
  findMissingReturnType,
  findEventListenerWithoutCleanup,
  findMissingDependencyArray,
};
