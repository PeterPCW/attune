import { Framework, PackageJson, ProjectType, Language } from '../types/index.js';

/**
 * Interface for framework detection
 * Allows for mocking in tests and alternative implementations
 */
export interface IFrameworkDetector {
  /**
   * Detect the framework based on project files
   */
  detect(): Framework;

  /**
   * Detect project type (cli, library, webapp, etc.)
   */
  detectProjectType(): ProjectType;

  /**
   * Detect primary language (python, typescript, javascript)
   */
  detectLanguage(): Language;

  /**
   * Get package.json if present
   */
  getPackageJson(): PackageJson | null;

  /**
   * Get list of project files
   */
  getProjectFiles(extensions?: string[]): string[];
}

/**
 * Interface for file scanning
 * Allows for different scanning strategies (async, parallel, etc.)
 */
export interface IScanner {
  /**
   * Scan directory for files
   */
  scan(projectRoot: string): import('../types/index.js').SourceFile[];

  /**
   * Get file statistics for caching
   */
  getFileStats?(projectRoot: string): Map<string, { mtime: number; size: number }>;
}

/**
 * Interface for rule registry
 * Allows for different rule loading strategies
 */
export interface IRuleRegistry {
  /**
   * Get rules for a specific framework and options
   */
  getRulesForFramework(
    framework: Framework,
    options: import('../types/index.js').CliOptions,
    projectType?: ProjectType
  ): import('../types/index.js').DetectionRule[];

  /**
   * Get relevant file extensions for the rules
   */
  getRelevantExtensions(
    framework: Framework,
    options: import('../types/index.js').CliOptions,
    projectType?: ProjectType
  ): Set<string>;
}