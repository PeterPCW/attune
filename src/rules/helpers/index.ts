import { Finding, AnalysisContext, SourceFile } from '../../types/index.js';
import { astHelperRegistry } from './ast-helpers.js';

// ============================================
// Helper Function Types
// ============================================

export interface FindPatternParams {
  patterns: string[];
  message: string;
  skipComments?: boolean;
  checkAssignment?: boolean;
  excludeTypes?: boolean;
}

export interface FindOnLinesParams {
  pattern: string;
  message: string;
  fileExtensions?: string[];
  skipPaths?: string[];
}

export interface FindWithExclusionsParams {
  pattern: string;
  message: string;
  excludePatterns?: string[];
  contextRadius?: number;
}

export interface FindImportParams {
  importPatterns: string[];
  message: string;
}

export interface FindDependencyParams {
  dependencies: string[];
  message: string;
}

export interface FindQueryParams {
  queryTypes: string[];
  message: string;
}

export interface FindReactHookParams {
  hookName: string;
  message: string;
  checkMissingDeps?: boolean;
}

export interface FindInlineHandlerParams {
  message: string;
  frameworks?: string[];
}

// ============================================
// Core Helper Functions
// ============================================

/**
 * Find patterns on specific lines in files
 */
export function findOnLines(
  context: AnalysisContext,
  params: FindOnLinesParams
): Finding[] {
  const findings: Finding[] = [];
  const { pattern, message, fileExtensions, skipPaths } = params;
  const regex = new RegExp(pattern, 'g');

  for (const file of context.files) {
    // Skip by path
    if (skipPaths && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    // Skip by extension
    if (fileExtensions && !fileExtensions.some(ext => file.path.endsWith(ext))) {
      continue;
    }

    const lines = file.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const match = regex.exec(lines[i]);
      if (match) {
        findings.push({
          id: `found-${file.path}-${i + 1}`,
          ruleId: '',
          severity: 'medium',
          category: 'complexity',
          file: file.path,
          line: i + 1,
          message,
          code: lines[i].trim()
        });
      }
    }
  }

  return findings;
}

/**
 * Find hardcoded secrets with configurable options
 */
export function findHardcodedSecret(
  context: AnalysisContext,
  params: FindPatternParams
): Finding[] {
  const findings: Finding[] = [];
  const { patterns, message, skipComments } = params;

  // Patterns that look like actual secret values (not just words)
  // These match known secret formats and clearly suspicious strings
  const secretValuePatterns = [
    // JWT tokens (xxxxx.xxxxx.xxxxx)
    /['"](eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)['"]/g,
    // AWS Access Keys (AKIA...)
    /['"](AKIA[0-9A-Z]{16})['"]/g,
    // Stripe live keys
    /['"](sk_live_[0-9a-zA-Z]{24,})['"]/g,
    /['"](pk_live_[0-9a-zA-Z]{24,})['"]/g,
    // Stripe test keys (still concerning if accidentally committed)
    /['"](sk_test_[0-9a-zA-Z]{24,})['"]/g,
    /['"](rk_test_[0-9a-zA-Z]{24,})['"]/g,
    // Private key headers
    /['"]-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----['"]/g,
    // GitHub tokens (ghp_, gho_, ghs_)
    /['"](gh[pous]_[A-Za-z0-9_]{36,})['"]/g,
    // Slack tokens (xox[baprs]-...)
    /['"](xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*)['"]/g,
    // Google API keys (starts with AIza)
    /['"](AIza[0-9A-Za-z_-]{35})['"]/g,
    // OpenAI keys (sk-...)
    /['"](sk-[0-9a-zA-Z]{48,})['"]/g,
    // Anthropic keys (sk-ant-...)
    /['"](sk-ant-[0-9a-zA-Z_-]{50,})['"]/g,
    // MongoDB connection string with password - only in string literals (single/double quotes), not template literals
    /['"](mongodb(\+srv)?:\/\/[^:<>]+:[^@]+@[^\s"']+)['"]/g,
  ];

  // Words that indicate a secret field name (for targeted checks in credential files)
  const secretFieldNames = [
    'apikey', 'api_key', 'secretkey', 'secret_key', 'accesskey', 'access_key',
    'password', 'passwd', 'privatekey', 'private_key', 'authtoken', 'auth_token'
  ];

  const secretPatterns = patterns.map(p => new RegExp(p, 'gi'));

  for (const file of context.files) {
    const lines = file.content.split('\n');

    // Check if file is likely a credentials file
    const fileName = file.path.toLowerCase();
    const isLikelyCredentialFile = fileName.includes('credentials') ||
                                    fileName.includes('secret') ||
                                    fileName.includes('apikey');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip comments if configured
      if (skipComments && (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*'))) {
        continue;
      }

      // 1. First, check for actual secret VALUES (the main improvement)
      // This runs on ALL files
      for (const valuePattern of secretValuePatterns) {
        valuePattern.lastIndex = 0; // Reset regex state
        let match;
        while ((match = valuePattern.exec(line)) !== null) {
          findings.push({
            id: `secret-${file.path}-${i + 1}-${match[1]?.substring(0, 8)}`,
            ruleId: '',
            severity: 'critical',
            category: 'security',
            file: file.path,
            line: i + 1,
            message: `Hardcoded secret detected: "${match[1]?.substring(0, 12)}..." - move to environment variables`,
            code: line.trim()
          });
        }
      }

      // 2. For credential files, also check for suspicious non-env default values in secret fields
      // This catches: password = 'somepassword123' (not using process.env)
      if (isLikelyCredentialFile) {
        for (const fieldName of secretFieldNames) {
          // Match: password = 'value' or password: 'value' but NOT process.env.password
          const fieldPattern = new RegExp(`\\b${fieldName}\\b\\s*[:=]\\s*['"][^'"]+['"]`, 'i');
          // Exclude: process.env.X, default: '', n8n expressions, examples, placeholders, and non-secret values
          if (fieldPattern.test(line) &&
              !line.includes('process.env') &&
              !line.includes('default:') &&
              !line.includes('={{') &&
              !line.includes('<') &&  // Exclude placeholders like <USERNAME>
              !line.includes('localhost') &&
              !line.includes('127.0.0.1') &&
              !/\b(not-needed|none|null|empty|false|no|0)\b/i.test(line)) {
            findings.push({
              id: `secret-field-${file.path}-${i + 1}`,
              ruleId: '',
              severity: 'critical',
              category: 'security',
              file: file.path,
              line: i + 1,
              message: `Hardcoded value in credential field '${fieldName}' - use process.env instead`,
              code: line.trim()
            });
          }
        }
      }
    }
  }

  return findings;
}

/**
 * Find patterns with exclusion zones around matches
 */
export function findWithExclusions(
  context: AnalysisContext,
  params: FindWithExclusionsParams
): Finding[] {
  const findings: Finding[] = [];
  const { pattern, message, excludePatterns = [], contextRadius = 50 } = params;
  const regex = new RegExp(pattern, 'g');

  for (const file of context.files) {
    const content = file.content;
    const lines = content.split('\n');
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Check if match is in an exclusion zone
      let shouldExclude = false;
      const matchContext = content.substring(
        Math.max(0, match.index - contextRadius),
        Math.min(content.length, match.index + contextRadius)
      );

      for (const excludePattern of excludePatterns) {
        const excludeRegex = new RegExp(excludePattern);
        if (excludeRegex.test(matchContext)) {
          shouldExclude = true;
          break;
        }
      }

      if (!shouldExclude) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        findings.push({
          id: `find-${file.path}-${lineNumber}`,
          ruleId: '',
          severity: 'medium',
          category: 'complexity',
          file: file.path,
          line: lineNumber,
          message,
          code: lines[lineNumber - 1]?.trim() || ''
        });
      }
    }
  }

  return findings;
}

/**
 * Find specific import patterns
 */
export function findImport(
  context: AnalysisContext,
  params: FindImportParams
): Finding[] {
  const findings: Finding[] = [];
  const { importPatterns, message } = params;

  const importRegexes = importPatterns.map(p => new RegExp(p, 'g'));

  for (const file of context.files) {
    const lines = file.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Only check import statements
      if (!line.includes('import ') && !line.includes('require(')) {
        continue;
      }

      for (const regex of importRegexes) {
        if (regex.test(line)) {
          findings.push({
            id: `import-${file.path}-${i + 1}`,
            ruleId: '',
            severity: 'medium',
            category: 'maintainability',
            file: file.path,
            line: i + 1,
            message,
            code: line.trim()
          });
          break;
        }
      }
    }
  }

  return findings;
}

/**
 * Find specific dependency usage
 */
export function findDependency(
  context: AnalysisContext,
  params: FindDependencyParams
): Finding[] {
  const findings: Finding[] = [];
  const { dependencies, message } = params;

  const depPatterns = dependencies.map(d => new RegExp(d, 'g'));

  for (const file of context.files) {
    const lines = file.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of depPatterns) {
        if (pattern.test(line)) {
          findings.push({
            id: `dep-${file.path}-${i + 1}`,
            ruleId: '',
            severity: 'medium',
            category: 'maintainability',
            file: file.path,
            line: i + 1,
            message,
            code: line.trim()
          });
          break;
        }
      }
    }
  }

  return findings;
}

/**
 * Find database queries
 */
export function findQuery(
  context: AnalysisContext,
  params: FindQueryParams
): Finding[] {
  const findings: Finding[] = [];
  const { queryTypes, message } = params;

  const queryPatterns = queryTypes.map(q => new RegExp(q, 'gi'));

  for (const file of context.files) {
    const lines = file.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of queryPatterns) {
        if (pattern.test(line)) {
          findings.push({
            id: `query-${file.path}-${i + 1}`,
            ruleId: '',
            severity: 'medium',
            category: 'security',
            file: file.path,
            line: i + 1,
            message,
            code: line.trim()
          });
          break;
        }
      }
    }
  }

  return findings;
}

/**
 * Find React hooks
 */
export function findReactHook(
  context: AnalysisContext,
  params: FindReactHookParams
): Finding[] {
  const findings: Finding[] = [];
  const { hookName, message } = params;

  const hookPattern = new RegExp(hookName, 'g');

  for (const file of context.files) {
    if (!file.path.endsWith('.tsx') && !file.path.endsWith('.ts') && !file.path.endsWith('.jsx') && !file.path.endsWith('.js')) {
      continue;
    }

    const lines = file.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (hookPattern.test(line)) {
        findings.push({
          id: `hook-${file.path}-${i + 1}`,
          ruleId: '',
          severity: 'medium',
          category: 'react',
          file: file.path,
          line: i + 1,
          message,
          code: line.trim()
        });
      }
    }
  }

  return findings;
}

/**
 * Find inline event handlers in JSX
 */
export function findInlineHandler(
  context: AnalysisContext,
  params: FindInlineHandlerParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, frameworks = [] } = params;

  // Only run for specific frameworks if specified
  if (frameworks.length > 0 && !frameworks.includes(context.framework)) {
    return findings;
  }

  const handlerPattern = /on[A-Z]\w+\s*=\s*\{/g;

  for (const file of context.files) {
    if (!file.path.endsWith('.tsx') && !file.path.endsWith('.jsx')) {
      continue;
    }

    const lines = file.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (handlerPattern.test(line)) {
        findings.push({
          id: `handler-${file.path}-${i + 1}`,
          ruleId: '',
          severity: 'medium',
          category: 'react',
          file: file.path,
          line: i + 1,
          message,
          code: line.trim()
        });
      }
    }
  }

  return findings;
}

/**
 * Find framework-specific patterns
 */
export function findFrameworkSpecific(
  context: AnalysisContext,
  params: FindOnLinesParams
): Finding[] {
  const { frameworks = [] } = params;

  // Only run for specific frameworks if specified
  if (frameworks.length > 0 && !frameworks.includes(context.framework)) {
    return [];
  }

  return findOnLines(context, params);
}

/**
 * Find sensitive data being logged - only flags when variables are logged, not static strings
 * E.g., console.log(user.password) is bad, but console.log("Invalid password") is ok
 */
export function findSensitiveLogging(
  context: AnalysisContext,
  params: { message: string }
): Finding[] {
  const findings: Finding[] = [];
  const { message } = params;

  // Logging patterns that capture variable references to sensitive data
  const loggingPatterns = [
    // console.log/v1/v2/debug/error/warn/info with variable references
    /console\.\w+\s*\(\s*[^)]*\b(?:password|passwd|secret|token|auth|authorization|card|credit|ssn|social|birth|dob|email|phone|address|bank|routing|api_key|apikey|private|access|refresh)\b/i,
    // logger.info/warn/error/debug with variable references
    /logger\.\w+\s*\(\s*[^)]*\b(?:password|passwd|secret|token|auth|authorization|card|credit|ssn|social|birth|dob|email|phone|address|bank|routing|api_key|apikey|private|access|refresh)\b/i,
    // winston logger
    /winston\.\w+\s*\(\s*[^)]*\b(?:password|passwd|secret|token|auth|authorization|card|credit|ssn|social|birth|dob|email|phone|address|bank|routing|api_key|apikey|private|access|refresh)\b/i,
    // log.info, log.error (common pattern)
    /log\.\w+\s*\(\s*[^)]*\b(?:password|passwd|secret|token|auth|authorization|card|credit|ssn|social|birth|dob|email|phone|address|bank|routing|api_key|apikey|private|access|refresh)\b/i,
  ];

  // Static string patterns to EXCLUDE (these are fine)
  const staticStringExclusions = [
    /console\.\w+\s*\(\s*['"][^'"]*(?:password|passwd|secret|token|auth)[^'"]*['"]\s*\)/i,
    /logger\.\w+\s*\(\s*['"][^'"]*(?:password|passwd|secret|token|auth)[^'"]*['"]\s*\)/i,
  ];

  for (const file of context.files) {
    const lines = file.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip if it's just a static string (not logging a variable)
      let isStaticString = false;
      for (const exclusion of staticStringExclusions) {
        if (exclusion.test(line)) {
          isStaticString = true;
          break;
        }
      }
      if (isStaticString) continue;

      // Check for logging with variable references to sensitive data
      for (const pattern of loggingPatterns) {
        if (pattern.test(line)) {
          // Ensure there's a variable reference (not just the word in a string)
          const hasVariableRef = /\(\s*[^'"]*\.(?:password|passwd|secret|token|auth|card|credit|ssn|social)\b/i.test(line) ||
                                  /\(\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\)/.test(line) ||
                                  /\{[^}]*(?:password|passwd|secret|token|auth|card|credit|ssn|social)[^}]*\}/.test(line);

          if (hasVariableRef) {
            findings.push({
              id: `log-${file.path}-${i + 1}`,
              ruleId: '',
              severity: 'high',
              category: 'security',
              file: file.path,
              line: i + 1,
              message,
              code: line.trim()
            });
            break;
          }
        }
      }
    }
  }

  return findings;
}

/**
 * Find credentials in URLs
 */
export function findUrlCredentials(
  context: AnalysisContext,
  params: { message: string }
): Finding[] {
  const findings: Finding[] = [];
  const { message } = params;

  const urlCredsPattern = /(?:https?:\/\/)?(?:[\w-]+:[^\s@]+@)[\w.-]+/;

  for (const file of context.files) {
    const lines = file.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (urlCredsPattern.test(line)) {
        findings.push({
          id: `url-${file.path}-${i + 1}`,
          ruleId: '',
          severity: 'high',
          category: 'security',
          file: file.path,
          line: i + 1,
          message,
          code: line.trim()
        });
      }
    }
  }

  return findings;
}

/**
 * Find cookie without secure flags
 */
export function findInsecureCookie(
  context: AnalysisContext,
  params: { message: string }
): Finding[] {
  const findings: Finding[] = [];
  const { message } = params;

  const cookiePattern = /res\.cookie\s*\(|cookie\s*\(/;

  for (const file of context.files) {
    const content = file.content;

    if (cookiePattern.test(content)) {
      // Check if secure and httpOnly are set
      if (!content.includes('secure: true') && !content.includes('httpOnly: true')) {
        const lines = content.split('\n');
        findings.push({
          id: `cookie-${file.path}-1`,
          ruleId: '',
          severity: 'high',
          category: 'security',
          file: file.path,
          line: 1,
          message,
          code: content.substring(0, 100)
        });
      }
    }
  }

  return findings;
}

/**
 * Find disabled certificate validation
 */
export function findDisabledCertValidation(
  context: AnalysisContext,
  params: { message: string }
): Finding[] {
  const findings: Finding[] = [];
  const { message } = params;

  const selfSignedPatterns = [
    /rejectUnauthorized:\s*false/,
    /secure:\s*false/,
    /rejectUnauthorized\s*=\s*false/,
  ];

  for (const file of context.files) {
    const lines = file.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of selfSignedPatterns) {
        if (pattern.test(line)) {
          findings.push({
            id: `cert-${file.path}-${i + 1}`,
            ruleId: '',
            severity: 'medium',
            category: 'security',
            file: file.path,
            line: i + 1,
            message,
            code: line.trim()
          });
          break;
        }
      }
    }
  }

  return findings;
}

/**
 * Find exposed Next.js secrets
 */
export function findExposedNextjsSecrets(
  context: AnalysisContext,
  params: { message: string }
): Finding[] {
  const findings: Finding[] = [];
  const { message } = params;

  // Only run for Next.js
  if (context.framework !== 'nextjs') {
    return findings;
  }

  const secretPatterns = [
    /NEXT_PUBLIC_(?:STRIPE_SECRET|SECRET_KEY|API_SECRET|PRIVATE)/i,
    /NEXT_PUBLIC_AWS_SECRET/i,
    /NEXT_PUBLIC_DATABASE_URL/i
  ];

  for (const file of context.files) {
    const lines = file.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of secretPatterns) {
        if (pattern.test(line)) {
          findings.push({
            id: `nextjs-secret-${file.path}-${i + 1}`,
            ruleId: '',
            severity: 'critical',
            category: 'security',
            file: file.path,
            line: i + 1,
            message,
            code: line.trim()
          });
        }
      }
    }
  }

  return findings;
}

export interface FindMissingParams {
  pattern: string;
  message: string;
  frameworks?: string[];
  skipPaths?: string[];
  fileExtensions?: string[];
}

/**
 * Find when a pattern is MISSING (i.e., report finding when pattern is not found)
 */
export function findMissing(
  context: AnalysisContext,
  params: FindMissingParams
): Finding[] {
  const findings: Finding[] = [];
  const { pattern, message, frameworks = [], skipPaths = [], fileExtensions = [] } = params;

  // Check framework filter
  if (frameworks.length > 0 && !frameworks.includes(context.framework)) {
    return findings;
  }

  // Look for the pattern - if NOT found, that's a finding
  const regex = new RegExp(pattern);
  let found = false;

  for (const file of context.files) {
    // Skip by path
    if (skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    // Skip by extension
    if (fileExtensions.length > 0 && !fileExtensions.some(ext => file.path.endsWith(ext))) {
      continue;
    }

    if (regex.test(file.content)) {
      found = true;
      break;
    }
  }

  // If pattern was not found, report a finding
  if (!found && context.files.length > 0) {
    findings.push({
      id: `missing-${pattern}`,
      ruleId: '',
      severity: 'high',
      category: 'error-handling',
      file: context.files[0].path,
      line: 1,
      message,
      code: message
    });
  }

  return findings;
}

// ============================================
// Duplicate Code Detection
// ============================================

export interface FindDuplicateCodeParams {
  minChunkLines: number;    // Minimum lines per chunk (default: 5)
  minOccurrences: number;   // Minimum files with same chunk (default: 2)
  message: string;
  fileExtensions?: string[];
  skipPaths?: string[];
}

/**
 * Find duplicate code chunks across multiple files
 * Uses a sliding window approach for O(n) performance
 */
export function findDuplicateCode(
  context: AnalysisContext,
  params: FindDuplicateCodeParams
): Finding[] {
  const findings: Finding[] = [];
  const { minChunkLines = 5, minOccurrences = 2, message, fileExtensions, skipPaths } = params;

  // Filter files by extension and path
  const relevantFiles = context.files.filter(file => {
    if (skipPaths && skipPaths.some(p => file.path.includes(p))) {
      return false;
    }
    if (fileExtensions && !fileExtensions.some(ext => file.path.endsWith(ext))) {
      return false;
    }
    return true;
  });

  // Skip if not enough files
  if (relevantFiles.length < minOccurrences) {
    return findings;
  }

  // Map to track chunks and which files they appear in
  const chunkMap = new Map<string, Set<string>>();

  // Process each file
  for (const file of relevantFiles) {
    const lines = file.content.split('\n');
    const contentHash = new Map<string, number>();

    // Create chunks using sliding window
    for (let i = 0; i <= lines.length - minChunkLines; i++) {
      // Get chunk of minChunkLines
      const chunkLines = lines.slice(i, i + minChunkLines);

      // Skip if mostly whitespace or comments
      const nonEmpty = chunkLines.filter(l => {
        const trimmed = l.trim();
        return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*');
      });

      if (nonEmpty.length < minChunkLines * 0.6) {
        continue; // Skip if >40% is whitespace/comments
      }

      // Normalize the chunk (remove extra whitespace for comparison)
      const normalized = chunkLines.map(l => l.trimEnd()).join('\n');

      // Skip very short normalized content
      if (normalized.length < 30) {
        continue;
      }

      // Track this chunk
      const existing = contentHash.get(normalized) || 0;
      contentHash.set(normalized, existing + 1);
    }

    // Add to global map (only chunks that appear multiple times in same file OR once but worth checking)
    for (const [chunk, count] of contentHash) {
      if (count >= 2 || (count === 1 && relevantFiles.length >= 3)) {
        const fileSet = chunkMap.get(chunk) || new Set();
        fileSet.add(file.path);
        chunkMap.set(chunk, fileSet);
      }
    }
  }

  // Find chunks appearing in multiple files
  for (const [chunk, fileSet] of chunkMap) {
    if (fileSet.size >= minOccurrences) {
      // Get first occurrence for the location
      const firstFile = relevantFiles.find(f => fileSet.has(f.path));
      const firstLine = firstFile ? firstFile.content.split('\n').findIndex(l => l.trimEnd() === chunk.split('\n')[0]?.trimEnd()) + 1 : 1;

      findings.push({
        id: 'DUPLICATE_CODE',
        ruleId: 'MAIN_DRY_VIOLATION',
        severity: 'low',
        category: 'maintainability',
        file: firstFile?.path || 'unknown',
        line: firstLine,
        message: message || `Duplicate code found across ${fileSet.size} files - consider extracting to shared utility`,
        code: chunk.split('\n').slice(0, 3).join('\n') + (chunk.split('\n').length > 3 ? '\n...' : ''),
        recommendation: {
          title: 'Extract duplicate code',
          description: `This code block appears in ${fileSet.size} files. Consider extracting to a shared utility function.`,
        }
      });
    }
  }

  return findings;
}

// ============================================
// Helper Registry
// ============================================

export const helperRegistry: Record<string, (context: AnalysisContext, params: unknown) => Finding[]> = {
  findOnLines,
  findHardcodedSecret,
  findWithExclusions,
  findImport,
  findDependency,
  findQuery,
  findReactHook,
  findInlineHandler,
  findFrameworkSpecific,
  findSensitiveLogging,
  findUrlCredentials,
  findInsecureCookie,
  findDisabledCertValidation,
  findExposedNextjsSecrets,
  findLargeFiles,
  findHighComplexity,
  findMissing,
  findMissingAltText,
  findMissingFormLabels,
  findUnlabeledButtons,
  findMissingLang,
  findMissingLandmarks,
  findRemovedFocusIndicator,
  findDuplicateCssValues,
  findDuplicateCode,
  // AST-based helpers
  ...astHelperRegistry,
};

// ============================================
// Complexity Helpers
// ============================================

export interface FindLargeFilesParams {
  maxLines: number;
  message: string;
  skipPaths?: string[];
}

/**
 * Find files that exceed the maximum line count
 */
export function findLargeFiles(
  context: AnalysisContext,
  params: FindLargeFilesParams
): Finding[] {
  const findings: Finding[] = [];
  const { maxLines, message, skipPaths } = params;

  for (const file of context.files) {
    // Skip files matching skipPaths
    if (skipPaths && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    const lineCount = file.content.split('\n').length;

    if (lineCount > maxLines) {
      findings.push({
        id: `large-file-${file.path}`,
        ruleId: '',
        severity: 'medium',
        category: 'complexity',
        file: file.path,
        line: 1,
        message: `${message} (${lineCount} lines)`,
        code: `File has ${lineCount} lines, max recommended: ${maxLines}`
      });
    }
  }

  return findings;
}

export interface FindHighComplexityParams {
  threshold: number;
  message: string;
  skipPaths?: string[];
}

/**
 * Find functions with high cyclomatic complexity
 */
export function findHighComplexity(
  context: AnalysisContext,
  params: FindHighComplexityParams
): Finding[] {
  const findings: Finding[] = [];
  const { threshold, message, skipPaths } = params;

  for (const file of context.files) {
    // Skip files matching skipPaths
    if (skipPaths && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    const content = file.content;
    const lines = content.split('\n');

    // Count complexity indicators: if, else, case, for, while, &&, ||
    let complexity = 0;
    const complexityPattern = /\b(if|else|case|for|while|catch|&&|\|\|)\b/g;
    let match;

    while ((match = complexityPattern.exec(content)) !== null) {
      complexity++;
    }

    // Check if complexity exceeds threshold
    if (complexity > threshold) {
      findings.push({
        id: `complex-${file.path}`,
        ruleId: '',
        severity: 'medium',
        category: 'complexity',
        file: file.path,
        line: 1,
        message: `${message} (complexity: ${complexity})`,
        code: `Cyclomatic complexity: ${complexity}, threshold: ${threshold}`
      });
    }
  }

  return findings;
}

// ============================================
// Accessibility Helpers
// ============================================

export interface AccessibilityParams {
  message: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Find images without alt text
 */
export function findMissingAltText(
  context: AnalysisContext,
  params: AccessibilityParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, severity = 'high' } = params;

  for (const file of context.files) {
    if (!file.path.endsWith('.html') && !file.path.endsWith('.jsx') && !file.path.endsWith('.tsx')) {
      continue;
    }

    // Find <img> tags without alt attribute or with empty alt=""
    const imgPattern = /<img(?![^>]*alt)[^>]*>/gi;
    let match;

    while ((match = imgPattern.exec(file.content)) !== null) {
      const lines = file.content.substring(0, match.index).split('\n');
      findings.push({
        id: `img-no-alt-${file.path}-${match.index}`,
        ruleId: '',
        severity,
        category: 'accessibility',
        file: file.path,
        line: lines.length,
        message,
        code: match[0]
      });
    }
  }

  return findings;
}

/**
 * Find form inputs without labels
 */
export function findMissingFormLabels(
  context: AnalysisContext,
  params: AccessibilityParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, severity = 'high' } = params;

  for (const file of context.files) {
    if (!file.path.endsWith('.html') && !file.path.endsWith('.jsx') && !file.path.endsWith('.tsx')) {
      continue;
    }

    // Find <input> tags without associated label
    const inputPattern = /<input(?![^>]*(?:aria-label|aria-labelledby|<label))[^/]*\/?>/gi;
    let match;

    while ((match = inputPattern.exec(file.content)) !== null) {
      const lines = file.content.substring(0, match.index).split('\n');
      findings.push({
        id: `input-no-label-${file.path}-${match.index}`,
        ruleId: '',
        severity,
        category: 'accessibility',
        file: file.path,
        line: lines.length,
        message,
        code: match[0]
      });
    }
  }

  return findings;
}

/**
 * Find buttons without accessible names
 */
export function findUnlabeledButtons(
  context: AnalysisContext,
  params: AccessibilityParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, severity = 'high' } = params;

  for (const file of context.files) {
    if (!file.path.endsWith('.html') && !file.path.endsWith('.jsx') && !file.path.endsWith('.tsx')) {
      continue;
    }

    // Find <button> without text or aria-label
    const buttonPattern = /<button(?![^>]*aria-label)(?![^>]*aria-labelledby)[^>]*>[\s]*<\/button>/gi;
    let match;

    while ((match = buttonPattern.exec(file.content)) !== null) {
      const lines = file.content.substring(0, match.index).split('\n');
      findings.push({
        id: `button-no-label-${file.path}-${match.index}`,
        ruleId: '',
        severity,
        category: 'accessibility',
        file: file.path,
        line: lines.length,
        message,
        code: match[0]
      });
    }
  }

  return findings;
}

/**
 * Find missing lang attribute on HTML
 */
export function findMissingLang(
  context: AnalysisContext,
  params: AccessibilityParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, severity = 'medium' } = params;

  for (const file of context.files) {
    if (!file.path.endsWith('.html')) continue;

    // Check if <html> has lang attribute
    if (!/<html[^>]*lang=/i.test(file.content)) {
      findings.push({
        id: `html-no-lang-${file.path}`,
        ruleId: '',
        severity,
        category: 'accessibility',
        file: file.path,
        line: 1,
        message,
        code: '<html> without lang attribute'
      });
    }
  }

  return findings;
}

/**
 * Find missing semantic landmarks
 */
export function findMissingLandmarks(
  context: AnalysisContext,
  params: AccessibilityParams & { landmarks?: string[] }
): Finding[] {
  const findings: Finding[] = [];
  const { message, severity = 'medium', landmarks = ['header', 'nav', 'main', 'footer'] } = params;

  for (const file of context.files) {
    if (!file.path.endsWith('.html') && !file.path.endsWith('.jsx') && !file.path.endsWith('.tsx')) {
      continue;
    }

    for (const landmark of landmarks) {
      const pattern = new RegExp(`<${landmark}[^>]*>`, 'i');
      if (!pattern.test(file.content)) {
        findings.push({
          id: `no-${landmark}-${file.path}`,
          ruleId: '',
          severity,
          category: 'accessibility',
          file: file.path,
          line: 1,
          message: `${message} - missing <${landmark}> landmark`,
          code: `No <${landmark}> element found`
        });
      }
    }
  }

  return findings;
}

/**
 * Find focus indicator removal
 */
export function findRemovedFocusIndicator(
  context: AnalysisContext,
  params: AccessibilityParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, severity = 'high' } = params;

  for (const file of context.files) {
    // Look for outline: none or outline: 0 without alternative focus style
    const focusPattern = /:focus\s*\{[^}]*outline:\s*(none|0)[^}]*\}/gi;
    let match;

    while ((match = focusPattern.exec(file.content)) !== null) {
      const lines = file.content.substring(0, match.index).split('\n');

      // Check if there's an alternative focus style defined
      const hasAlternativeFocus = /:focus-visible|:focus-within/.test(file.content);

      if (!hasAlternativeFocus) {
        findings.push({
          id: `no-focus-${file.path}-${match.index}`,
          ruleId: '',
          severity,
          category: 'accessibility',
          file: file.path,
          line: lines.length,
          message,
          code: match[0]
        });
      }
    }
  }

  return findings;
}

// ============================================
// CSS Quality Helpers
// ============================================

export interface DuplicateCssValuesParams {
  message: string;
  /** Minimum occurrences to trigger a finding */
  threshold?: number;
  /** File extensions to check */
  fileExtensions?: string[];
  /** Paths to skip */
  skipPaths?: string[];
}

/**
 * Find duplicate CSS values across files (colors, font sizes, spacing, etc.)
 * This helper scans all relevant files and reports values that appear multiple times
 */
export function findDuplicateCssValues(
  context: AnalysisContext,
  params: DuplicateCssValuesParams
): Finding[] {
  const findings: Finding[] = [];
  const { message, threshold = 2, fileExtensions = ['.css', '.scss', '.less', '.html', '.tsx', '.ts', '.js'], skipPaths = ['node_modules', 'dist', '.attune', 'research'] } = params;

  // Patterns to extract CSS-like values
  const valuePatterns = {
    // Colors: #hex, rgb(), rgba()
    colors: /(?:#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/g,
    // Font sizes: 14px, 1.2rem, 1em (not 0.x)
    fontSizes: /(?<![a-z0-9-])(?:0\.\d+|\d+(?:\.\d+)?)(?:px|rem|em)(?![a-z0-9-])/g,
    // Spacing: commonly used padding/margin values
    spacing: /(?<![a-z0-9-])(?:\d+)(?:px|rem)(?![a-z0-9-])/g,
    // Border radius
    borderRadius: /(?<![a-z0-9-])(\d+px)(?![a-z0-9-])/g,
  };

  // Track all values across files
  const valueCounts: Record<string, { count: number; files: Set<string> }> = {};

  for (const file of context.files) {
    // Skip by path
    if (skipPaths && skipPaths.some(p => file.path.includes(p))) {
      continue;
    }

    // Skip by extension
    if (!fileExtensions.some(ext => file.path.endsWith(ext))) {
      continue;
    }

    const content = file.content;

    // Extract all values
    for (const [type, pattern] of Object.entries(valuePatterns)) {
      // For JS/TS, only look in CSS-like strings (template literals with style content)
      if (file.path.endsWith('.ts') || file.path.endsWith('.js')) {
        // Find template literals that look like CSS
        const cssStrings = content.match(/`[^`]*:(?:background|color|border|margin|padding|font|radius)[^`]*`/g) || [];
        for (const str of cssStrings) {
          let match;
          const regex = new RegExp(pattern.source, 'g');
          while ((match = regex.exec(str)) !== null) {
            const val = match[0].toLowerCase();
            // Skip chalk and other JS color APIs
            if (str.includes('chalk') || str.includes('hex(')) continue;

            if (!valueCounts[val]) {
              valueCounts[val] = { count: 0, files: new Set() };
            }
            valueCounts[val].count++;
            valueCounts[val].files.add(file.path);
          }
        }
      } else {
        // For CSS/HTML files, scan everything
        let match;
        const regex = new RegExp(pattern.source, 'g');
        while ((match = regex.exec(content)) !== null) {
          const val = match[0].toLowerCase();

          if (!valueCounts[val]) {
            valueCounts[val] = { count: 0, files: new Set() };
          }
          valueCounts[val].count++;
          valueCounts[val].files.add(file.path);
        }
      }
    }
  }

  // Find duplicates exceeding threshold
  for (const [value, data] of Object.entries(valueCounts)) {
    if (data.count >= threshold) {
      // Only report if it's not a CSS variable (var(--xxx))
      if (!value.startsWith('var(')) {
        const fileList = Array.from(data.files).slice(0, 3).join(', ');

        findings.push({
          id: `dup-css-${value}`,
          ruleId: '',
          severity: 'low',
          category: 'css',
          file: Array.from(data.files)[0],
          line: 1,
          message: `${message}: "${value}" used ${data.count} times across ${data.files.size} files`,
          code: `Found in: ${fileList}${data.files.size > 3 ? '...' : ''}`
        });
      }
    }
  }

  return findings;
}
