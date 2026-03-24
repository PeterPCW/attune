import chalk from 'chalk';

/**
 * Log levels for structured logging
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log entry structure for JSON logging
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
  };
}

/**
 * Configuration for the logger
 */
export interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'pretty';
  includeContext: boolean;
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: 'info',
  format: process.env.CI === 'true' ? 'json' : 'pretty',
  includeContext: true,
};

let config: LoggerConfig = { ...DEFAULT_CONFIG };

/**
 * Set logger configuration
 */
export function configureLogger(newConfig: Partial<LoggerConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Get current logger configuration
 */
export function getLoggerConfig(): LoggerConfig {
  return { ...config };
}

/**
 * Check if a log level should be logged
 */
function shouldLog(level: LogLevel): boolean {
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = levels.indexOf(config.level);
  const messageLevelIndex = levels.indexOf(level);
  return messageLevelIndex >= currentLevelIndex;
}

/**
 * Format a log entry as JSON
 */
function formatJson(entry: LogEntry): string {
  return JSON.stringify(entry);
}

/**
 * Format a log entry for pretty printing
 */
function formatPretty(entry: LogEntry): string {
  const timestamp = entry.timestamp.split('T')[1].split('.')[0];
  const levelColors: Record<LogLevel, (s: string) => string> = {
    debug: chalk.gray,
    info: chalk.blue,
    warn: chalk.yellow,
    error: chalk.red,
  };

  const color = levelColors[entry.level];
  let output = `${chalk.gray(timestamp)} ${color(entry.level.toUpperCase().padEnd(5))} ${entry.message}`;

  if (entry.context && Object.keys(entry.context).length > 0 && config.includeContext) {
    output += ` ${chalk.gray(JSON.stringify(entry.context))}`;
  }

  if (entry.error) {
    output += `\n  ${chalk.red('Error:')} ${entry.error.message}`;
    if (entry.error.stack) {
      output += `\n${chalk.gray(entry.error.stack.split('\n').slice(1, 3).join('\n'))}`;
    }
  }

  return output;
}

/**
 * Create a log entry
 */
function createEntry(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error: error ? {
      message: error.message,
      stack: error.stack,
    } : undefined,
  };
}

/**
 * Log a debug message
 */
export function debug(message: string, context?: Record<string, unknown>): void {
  if (!shouldLog('debug')) return;
  const entry = createEntry('debug', message, context);
  const output = config.format === 'json' ? formatJson(entry) : formatPretty(entry);
  console.log(output);
}

/**
 * Log an info message
 */
export function info(message: string, context?: Record<string, unknown>): void {
  if (!shouldLog('info')) return;
  const entry = createEntry('info', message, context);
  const output = config.format === 'json' ? formatJson(entry) : formatPretty(entry);
  console.log(output);
}

/**
 * Log a warning message
 */
export function warn(message: string, context?: Record<string, unknown>): void {
  if (!shouldLog('warn')) return;
  const entry = createEntry('warn', message, context);
  const output = config.format === 'json' ? formatJson(entry) : formatPretty(entry);
  console.warn(output);
}

/**
 * Log an error message
 */
export function error(message: string, error?: Error, context?: Record<string, unknown>): void {
  if (!shouldLog('error')) return;
  const entry = createEntry('error', message, context, error);
  const output = config.format === 'json' ? formatJson(entry) : formatPretty(entry);
  console.error(output);
}

/**
 * Create a child logger with additional context
 */
export function child(defaultContext: Record<string, unknown>) {
  // Capture outer error function to avoid shadowing
  const errorFn = error;
  return {
    debug: (message: string, context?: Record<string, unknown>) =>
      debug(message, { ...defaultContext, ...context }),
    info: (message: string, context?: Record<string, unknown>) =>
      info(message, { ...defaultContext, ...context }),
    warn: (message: string, context?: Record<string, unknown>) =>
      warn(message, { ...defaultContext, ...context }),
    error: (message: string, error?: Error, context?: Record<string, unknown>) =>
      errorFn(message, error, { ...defaultContext, ...context }),
  };
}
