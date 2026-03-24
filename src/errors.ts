/**
 * Attune Error Codes
 *
 * Structured error codes for programmatic error handling and debugging.
 * Error codes are organized by category: SCAN, RULE, CONFIG, SYSTEM
 */

// Using const object instead of enum for better tree-shaking and type safety
export const ErrorCode = {
  // Scan errors (SCAN_*)
  SCAN_PATH_NOT_FOUND: 'SCAN_PATH_NOT_FOUND',
  SCAN_NOT_A_DIRECTORY: 'SCAN_NOT_A_DIRECTORY',
  SCAN_PERMISSION_DENIED: 'SCAN_PERMISSION_DENIED',
  SCAN_FILE_TOO_LARGE: 'SCAN_FILE_TOO_LARGE',
  SCAN_TIMEOUT: 'SCAN_TIMEOUT',
  SCAN_CANCELLED: 'SCAN_CANCELLED',

  // Rule errors (RULE_*)
  RULE_NOT_FOUND: 'RULE_NOT_FOUND',
  RULE_VALIDATION_FAILED: 'RULE_VALIDATION_FAILED',
  RULE_EXECUTION_ERROR: 'RULE_EXECUTION_ERROR',
  RULE_TIMEOUT: 'RULE_TIMEOUT',
  RULE_CIRCUIT_OPEN: 'RULE_CIRCUIT_OPEN',

  // Configuration errors (CONFIG_*)
  CONFIG_NOT_FOUND: 'CONFIG_NOT_FOUND',
  CONFIG_INVALID: 'CONFIG_INVALID',
  CONFIG_PERMISSION_DENIED: 'CONFIG_PERMISSION_DENIED',

  // Framework detection (DETECT_*)
  DETECT_FAILED: 'DETECT_FAILED',
  DETECT_AMBIGUOUS: 'DETECT_AMBIGUOUS',

  // System errors (SYS_*)
  SYS_OUT_OF_MEMORY: 'SYS_OUT_OF_MEMORY',
  SYS_DISK_FULL: 'SYS_DISK_FULL',
  SYS_UNCAUGHT_ERROR: 'SYS_UNCAUGHT_ERROR',
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

export interface AttuneError extends Error {
  code: ErrorCode;
  details?: Record<string, unknown>;
  recoverable: boolean;
}

/**
 * Create an AttuneError with structured information
 */
export function createError(
  code: ErrorCode,
  message: string,
  options: {
    details?: Record<string, unknown>;
    recoverable?: boolean;
    cause?: Error;
  } = {}
): AttuneError {
  const error = new Error(message) as AttuneError;
  error.code = code;
  error.details = options.details;
  error.recoverable = options.recoverable ?? true;
  error.cause = options.cause;

  return error;
}

/**
 * Check if an error is an AttuneError
 */
export function isAttuneError(error: unknown): error is AttuneError {
  return error instanceof Error && 'code' in error && 'recoverable' in error;
}

/**
 * Get human-readable description for error code
 */
export function getErrorDescription(code: ErrorCode): string {
  const descriptions: Record<ErrorCode, string> = {
    [ErrorCode.SCAN_PATH_NOT_FOUND]: 'The specified path does not exist',
    [ErrorCode.SCAN_NOT_A_DIRECTORY]: 'The specified path is not a directory',
    [ErrorCode.SCAN_PERMISSION_DENIED]: 'Permission denied to access path',
    [ErrorCode.SCAN_FILE_TOO_LARGE]: 'File exceeds maximum size limit',
    [ErrorCode.SCAN_TIMEOUT]: 'Scan operation timed out',
    [ErrorCode.SCAN_CANCELLED]: 'Scan was cancelled',
    [ErrorCode.RULE_NOT_FOUND]: 'Requested rule not found',
    [ErrorCode.RULE_VALIDATION_FAILED]: 'Rule validation failed',
    [ErrorCode.RULE_EXECUTION_ERROR]: 'Rule execution encountered an error',
    [ErrorCode.RULE_TIMEOUT]: 'Rule execution timed out',
    [ErrorCode.RULE_CIRCUIT_OPEN]: 'Circuit breaker is open, skipping rule',
    [ErrorCode.CONFIG_NOT_FOUND]: 'Configuration file not found',
    [ErrorCode.CONFIG_INVALID]: 'Configuration file is invalid',
    [ErrorCode.CONFIG_PERMISSION_DENIED]: 'Permission denied to read config',
    [ErrorCode.DETECT_FAILED]: 'Framework detection failed',
    [ErrorCode.DETECT_AMBIGUOUS]: 'Multiple frameworks detected, cannot determine',
    [ErrorCode.SYS_OUT_OF_MEMORY]: 'System out of memory',
    [ErrorCode.SYS_DISK_FULL]: 'Disk is full',
    [ErrorCode.SYS_UNCAUGHT_ERROR]: 'Uncaught error in application',
  };

  return descriptions[code] || 'Unknown error';
}

/**
 * Map standard errors to AttuneError codes
 */
export function mapError(error: unknown): AttuneError {
  if (isAttuneError(error)) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  const code = error instanceof Error ? (error as NodeJS.ErrnoException).code : undefined;

  // Map common Node.js errors
  if (code === 'ENOENT') {
    return createError(ErrorCode.SCAN_PATH_NOT_FOUND, message, { recoverable: true, cause: error as Error });
  }
  if (code === 'EACCES' || code === 'EPERM') {
    return createError(ErrorCode.SCAN_PERMISSION_DENIED, message, { recoverable: false, cause: error as Error });
  }
  if (code === 'ENOMEM') {
    return createError(ErrorCode.SYS_OUT_OF_MEMORY, message, { recoverable: false, cause: error as Error });
  }
  if (code === 'ENOSPC') {
    return createError(ErrorCode.SYS_DISK_FULL, message, { recoverable: false, cause: error as Error });
  }

  // Default to uncaught error
  return createError(ErrorCode.SYS_UNCAUGHT_ERROR, message, { recoverable: true, cause: error as Error });
}
