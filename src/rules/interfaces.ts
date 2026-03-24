/**
 * Rule Registry Interface
 *
 * Defines the contract for rule loading and execution.
 * Using an interface enables dependency injection for testing
 * and allows swapping implementations (e.g., legacy vs engine).
 */

import type { DetectionRule, CliOptions, Framework, ProjectType, Language, SourceFile, Finding } from '../../types/index.js';

export interface EngineOptions {
  logger?: 'default' | 'silent' | 'verbose';
  builtInRulesDir?: string;
  customRulesDir?: string;
  cwd?: string;
  // Circuit breaker configuration
  circuitBreakerTimeoutMs?: number;  // Max time per rule (default: 30000ms)
  circuitBreakerMaxFailures?: number; // Failures before opening circuit (default: 5)
  // Finding limits
  maxFindingsPerRule?: number;        // Max findings per rule (default: 10)
  globalMaxFindings?: number;        // Global cap for all findings (default: 10000)
}

export interface IRuleRegistry {
  /**
   * Get rules for a specific framework and options
   */
  getRulesForFramework(framework: Framework, options: CliOptions, projectType?: ProjectType): Promise<DetectionRule[]>;

  /**
   * Get all rules
   */
  getAllRules(): Promise<DetectionRule[]>;

  /**
   * Get relevant file extensions for pre-filtering
   */
  getRelevantExtensions(framework: Framework, options: CliOptions, projectType?: ProjectType): Set<string>;

  /**
   * Execute all rules and return findings
   */
  executeAll(
    files: SourceFile[],
    framework: Framework,
    options: CliOptions,
    projectType?: ProjectType,
    language?: Language
  ): Promise<Finding[]>;
}
