/**
 * Retry utility for handling transient file system errors
 */

import { randomBytes } from 'crypto';

// Configuration constants
const CONFIG = {
  DEFAULT_MAX_RETRIES: 3,
  DEFAULT_INITIAL_DELAY_MS: 100,
  DEFAULT_MAX_DELAY_MS: 5000,
  DEFAULT_BACKOFF_MULTIPLIER: 2,
  JITTER_RANGE: 100,
} as const;

// Error codes that indicate transient failures and should trigger retry
const TRANSIENT_ERROR_CODES = Object.freeze([
  'EACCES',   // Permission denied
  'EBUSY',    // Resource busy
  'EMFILE',    // Too many open files
  'ENFILE',    // Too many open files in system
  'ENOENT',    // File not found
  'EIO',       // I/O error
  'ECONNRESET',// Connection reset
  'ETIMEDOUT', // Operation timed out
  'ENOTDIR',   // Not a directory
]);

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Convert user options to full config with defaults
 */
function getConfig(options: RetryOptions = {}): RetryConfig {
  return {
    maxRetries: options.maxRetries ?? CONFIG.DEFAULT_MAX_RETRIES,
    initialDelayMs: options.initialDelayMs ?? CONFIG.DEFAULT_INITIAL_DELAY_MS,
    maxDelayMs: options.maxDelayMs ?? CONFIG.DEFAULT_MAX_DELAY_MS,
    backoffMultiplier: options.backoffMultiplier ?? CONFIG.DEFAULT_BACKOFF_MULTIPLIER,
  };
}

/**
 * Determine if an error is transient and worth retrying
 */
function isRetryableError(error: unknown): error is Error {
  if (!(error instanceof Error)) {
    return false;
  }

  // Check error code first
  const errorCode = (error as NodeJS.ErrnoException).code;
  if (errorCode && TRANSIENT_ERROR_CODES.includes(errorCode)) {
    return true;
  }

  // Check error message for known transient errors
  const msg = error.message.toLowerCase();
  return msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('eio') ||
    msg.includes('ebusy');
}

/**
 * Calculate delay with exponential backoff plus random jitter
 */
function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);
  // Use crypto for secure random jitter (not for crypto purposes, just randomness)
  const jitter = randomBytes(4).readUInt32BE(0) % CONFIG.JITTER_RANGE;
  return cappedDelay + jitter;
}

/**
 * Wait for specified milliseconds
 */
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async function with exponential backoff
 * @throws {Error} Re-throws the last error if all retries are exhausted
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const config = getConfig(options);
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if this was the last attempt
      if (attempt === config.maxRetries) {
        break;
      }

      // Don't retry non-transient errors
      if (!isRetryableError(error)) {
        throw error;
      }

      // Wait before retrying
      await wait(calculateBackoffDelay(attempt, config));
    }
  }

  throw lastError;
}

/**
 * Synchronous retry - fail fast for file operations
 * File system errors are rarely transient, so we don't retry with delay
 * to avoid blocking the event loop with busy-wait
 */
export function retrySync<T>(fn: () => T, options: RetryOptions = {}): T {
  const config = getConfig(options);
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return fn();
    } catch (error) {
      lastError = error;

      // Don't retry if this was the last attempt
      if (attempt === config.maxRetries) {
        break;
      }

      // Don't retry non-transient errors - fail fast
      if (!isRetryableError(error)) {
        throw error;
      }

      // For sync operations, skip the delay on last retry only
      // but still retry to handle transient busy errors
    }
  }

  throw lastError;
}
