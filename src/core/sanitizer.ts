import { Finding, ScanMetadata, CliOptions } from '../types/index.js';

// Note: For actual password handling in authentication flows, consider using zxcvbn
// for password strength validation (https://github.com/dropbox/zxcvbn)

// Secret patterns to redact
const SECRET_PATTERNS = [
  { pattern: /sk_live_[a-zA-Z0-9]{20,}/g, replacement: '[STRIPE_KEY]' },
  { pattern: /sk_test_[a-zA-Z0-9]{20,}/g, replacement: '[STRIPE_KEY]' },
  { pattern: /pk_live_[a-zA-Z0-9]{20,}/g, replacement: '[STRIPE_KEY]' },
  { pattern: /pk_test_[a-zA-Z0-9]{20,}/g, replacement: '[STRIPE_KEY]' },
  { pattern: /AKIA[0-9A-Z]{16}/g, replacement: '[AWS_KEY]' },
  { pattern: /aws_access_key_id[=\s]+[A-Z0-9]{20,}/gi, replacement: 'aws_access_key_id=[AWS_KEY]' },
  { pattern: /aws_secret_access_key[=\s]+[A-Za-z0-9/+/]{40,}/gi, replacement: 'aws_secret_access_key=[AWS_SECRET]' },
  { pattern: /ghp_[a-zA-Z0-9]{36}/g, replacement: '[GITHUB_TOKEN]' },
  { pattern: /gho_[a-zA-Z0-9]{36}/g, replacement: '[GITHUB_TOKEN]' },
  { pattern: /github_pat_[a-zA-Z0-9_]{22,}/g, replacement: '[GITHUB_TOKEN]' },
  { pattern: /xox[baprs]-[0-9a-zA-Z]{10,}/g, replacement: '[SLACK_TOKEN]' },
  { pattern: /[a-zA-Z0-9_-]*:[a-zA-Z0-9_-]+@github/g, replacement: '[GITHUB_CREDENTIALS]' },
  { pattern: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/g, replacement: 'mongodb://[USER]:[PASS]@' },
  { pattern: /postgresql:\/\/[^:]+:[^@]+@/g, replacement: 'postgresql://[USER]:[PASS]@' },
  { pattern: /mysql:\/\/[^:]+:[^@]+@/g, replacement: 'mysql://[USER]:[PASS]@' },
  { pattern: /redis:\/\/[^:]+:[^@]+@/g, replacement: 'redis://[USER]:[PASS]@' },
  { pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g, replacement: '[PRIVATE_KEY]' },
  { pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g, replacement: '[JWT_TOKEN]' },
];

// Environment variable patterns
const ENV_VAR_PATTERNS = [
  /_(KEY|SECRET|TOKEN|PASSWORD|PWD|CREDENTIALS?|AUTH)[=:\s]+/gi,
  /(API_KEY|API_SECRET|ACCESS_TOKEN|SESSION_SECRET)[=:\s]+/gi,
];

// Patterns that indicate a secret value
const SECRET_VALUE_PATTERNS = [
  /["'`](?:sk_|pk_|api_|access_|secret_|token_|password_)[a-zA-Z0-9_-]{10,}["'`]/gi,
  /password\s*[=:]\s*["'][^"']{8,}["']/gi,
  /passwd\s*[=:]\s*["'][^"']{8,}["']/gi,
  /pass\s*[=:]\s*["'][^"']{8,}["']/gi,
];

/**
 * Redact secrets from a string
 */
export function redactSecrets(text: string): string {
  let result = text;

  // Apply secret patterns
  for (const { pattern, replacement } of SECRET_PATTERNS) {
    result = result.replace(pattern, replacement);
  }

  // Redact environment variable assignments
  for (const pattern of ENV_VAR_PATTERNS) {
    result = result.replace(pattern, (_, name) => `${name}=[REDACTED]`);
  }

  // Redact obvious secret values
  for (const pattern of SECRET_VALUE_PATTERNS) {
    result = result.replace(pattern, (_, match) => `[SECRET]`);
  }

  return result;
}

/**
 * Convert absolute path to relative path
 */
export function redactPath(filePath: string, projectRoot: string): string {
  // Remove the project root to get relative path
  const relativePath = filePath.replace(projectRoot, '');

  // Remove leading slashes
  const cleanPath = relativePath.replace(/^\/+/, '');

  return cleanPath || '[root]';
}

/**
 * Redact username from paths
 */
export function redactUsername(path: string): string {
  // Common patterns for usernames in paths
  return path
    .replace(/\/home\/[a-zA-Z0-9_]+\//g, '/home/[user]/')
    .replace(/\/Users\/[a-zA-Z0-9_]+\//g, '/Users/[user]/')
    .replace(/\/c\/Users\/[a-zA-Z0-9_]+\//g, '/c/Users/[user]/')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]');
}

/**
 * Sanitize a file path based on options
 */
export function sanitizePath(filePath: string, projectRoot: string, options: CliOptions): string {
  let result = filePath;

  // Optionally redact username
  if (options.publicSafe) {
    result = redactUsername(result);
  }

  // Optionally convert to relative path
  if (options.publicSafe || options.noPaths) {
    result = redactPath(result, projectRoot);
  }

  return result;
}

/**
 * Sanitize code snippet based on options
 */
export function sanitizeCode(code: string | undefined, options: CliOptions): string | undefined {
  if (!code) return code;

  if (options.publicSafe || options.redactSecrets) {
    return redactSecrets(code);
  }

  return code;
}

/**
 * Sanitize findings based on options
 */
export function sanitizeFindings(findings: Finding[], projectRoot: string, options: CliOptions): Finding[] {
  let result = findings;

  // Filter out security findings if silent-security is enabled
  if (options.silentSecurity) {
    result = result.filter(f => f.category !== 'security');
  }

  // Sanitize each finding
  return result.map(finding => {
    const sanitized = { ...finding };

    // Sanitize file path
    if (options.publicSafe || options.noPaths) {
      sanitized.file = sanitizePath(finding.file, projectRoot, options);
    }

    // Sanitize code snippet
    if (options.publicSafe || options.redactSecrets) {
      sanitized.code = sanitizeCode(finding.code, options);
    }

    // Sanitize recommendation if it contains URLs that might leak info
    if (sanitized.recommendation?.library) {
      sanitized.recommendation = {
        ...sanitized.recommendation,
        library: sanitizeCode(sanitized.recommendation.library, options) || ''
      };
    }

    return sanitized;
  });
}

/**
 * Sanitize metadata
 */
export function sanitizeMetadata(metadata: ScanMetadata, options: CliOptions): ScanMetadata {
  const sanitized = { ...metadata };

  if (options.publicSafe || options.noPaths) {
    sanitized.projectRoot = '[PROJECT_ROOT]';
  }

  return sanitized;
}

/**
 * Check if a file might contain secrets and should be warned about
 */
export function checkForSensitiveFiles(files: { path: string }[]): string[] {
  const warnings: string[] = [];

  const sensitivePatterns = [
    { pattern: /\.env$/, message: '.env file detected - ensure it is in .gitignore' },
    { pattern: /\.env\.local$/, message: '.env.local file detected - ensure it is in .gitignore' },
    { pattern: /\.env\.prod(uction)?$/, message: 'Production .env file detected - ensure it is in .gitignore' },
    { pattern: /credentials\.json$/, message: 'credentials.json detected - ensure it is in .gitignore' },
    { pattern: /service-account\.json$/, message: 'service account JSON detected - ensure it is in .gitignore' },
    { pattern: /\.pem$/, message: 'Private key (.pem) detected - ensure it is in .gitignore' },
    { pattern: /\.key$/, message: 'Private key (.key) detected - ensure it is in .gitignore' },
  ];

  for (const file of files) {
    for (const { pattern, message } of sensitivePatterns) {
      if (pattern.test(file.path) && !warnings.includes(message)) {
        warnings.push(message);
      }
    }
  }

  return warnings;
}

/**
 * Generate a public-safe summary (without detailed findings)
 */
export function generateSummaryOnly(metadata: ScanMetadata, findings: Finding[]): object {
  const critical = findings.filter(f => f.severity === 'critical');
  const high = findings.filter(f => f.severity === 'high');
  const medium = findings.filter(f => f.severity === 'medium');
  const low = findings.filter(f => f.severity === 'low');

  // Group by category but don't include file details
  const byCategory: Record<string, number> = {};
  for (const f of findings) {
    byCategory[f.category] = (byCategory[f.category] || 0) + 1;
  }

  return {
    summary: {
      critical: critical.length,
      high: high.length,
      medium: medium.length,
      low: low.length,
      total: findings.length
    },
    categories: byCategory,
    framework: metadata.framework,
    scanTime: metadata.scanTime,
    filesScanned: metadata.filesScanned
  };
}
