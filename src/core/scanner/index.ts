import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { readFile, readdir, stat } from 'fs/promises';
import { join, normalize, isAbsolute } from 'path';
import { SourceFile } from '../types/index.js';
import { CacheManager } from '../cache/index.js';
import { retry, retrySync } from '../../utils/retry.js';

// Error tracking for visibility
export interface ScanError {
  operation: string;
  path: string;
  message: string;
  code?: string;
  timestamp: number;
}

// Global error tracker - accessible for reporting
const scanErrors: ScanError[] = [];
let verboseMode = false;

export function setVerboseErrors(enabled: boolean): void {
  verboseMode = enabled;
}

export function getScanErrors(): ScanError[] {
  return [...scanErrors];
}

export function clearScanErrors(): void {
  scanErrors.length = 0;
}

function trackError(operation: string, path: string, error: Error | string): void {
  const err: ScanError = {
    operation,
    path,
    message: error instanceof Error ? error.message : String(error),
    code: error instanceof Error ? (error as NodeJS.ErrnoException).code : undefined,
    timestamp: Date.now()
  };
  scanErrors.push(err);

  // In verbose mode, also log to console
  if (verboseMode) {
    console.warn(`[Scanner] ${operation} failed for ${path}: ${err.message}`);
  }
}

// Security: Normalize path to prevent path traversal attacks
function safePath(filePath: string, projectRoot: string): string {
  // Normalize the path to remove .. and .
  const normalized = normalize(filePath);

  // Convert to absolute if needed
  const absolutePath = isAbsolute(normalized) ? normalized : join(projectRoot, normalized);

  // Ensure the path is within the project root
  const absoluteRoot = normalize(projectRoot);
  if (!absolutePath.startsWith(absoluteRoot + '/') && absolutePath !== absoluteRoot) {
    throw new Error(`Path traversal attempt detected: ${filePath}`);
  }

  return absolutePath;
}

export interface FileScannerOptions {
  sourceExtensions?: string[];
  configExtensions?: string[];
  ignorePatterns?: string[];
  cacheManager?: CacheManager;
  // Pre-filter: only scan files matching these extensions
  relevantExtensions?: Set<string>;
  // Enable verbose error reporting
  verbose?: boolean;
}

export interface FileScanner {
  scan(projectRoot: string): SourceFile[];
  scanAsync?(projectRoot: string): Promise<SourceFile[]>;
  getFileStats?(projectRoot: string): Map<string, { mtime: number; size: number }>;
  getFileStatsAsync?(projectRoot: string): Promise<Map<string, { mtime: number; size: number }>>;
}

/**
 * Default file scanner implementation
 * Scans a project directory for source and config files
 */
export class DefaultFileScanner implements FileScanner {
  private sourceExtensions: string[];
  private configExtensions: string[];
  private ignorePatterns: string[];
  private cacheManager?: CacheManager;
  private relevantExtensions?: Set<string>;
  private verbose?: boolean;

  constructor(options: FileScannerOptions = {}) {
    this.sourceExtensions = options.sourceExtensions || ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte', '.astro'];
    this.configExtensions = options.configExtensions || ['.ts', '.js', '.json'];
    this.ignorePatterns = options.ignorePatterns || [];
    this.cacheManager = options.cacheManager;
    this.relevantExtensions = options.relevantExtensions;
    this.verbose = options.verbose;

    // Set global verbose mode for error tracking
    if (this.verbose) {
      setVerboseErrors(true);
    }
  }

  scan(projectRoot: string): SourceFile[] {
    const files: SourceFile[] = [];
    const normalizedRoot = normalize(projectRoot);

    // Always add default ignores
    const allIgnorePatterns = [...this.ignorePatterns, 'node_modules', 'dist', 'coverage', '.git'];

    // Scan src directory for source files
    const srcDir = join(normalizedRoot, 'src');
    if (existsSync(srcDir)) {
      this.scanDirectory(srcDir, files, this.sourceExtensions, false, normalizedRoot, allIgnorePatterns);
    } else {
      // Fall back to root directory
      this.scanDirectory(normalizedRoot, files, this.sourceExtensions, true, normalizedRoot, allIgnorePatterns);
    }

    // Also scan root directory for config files
    const configPatterns = [
      'vitest.config.ts', 'vitest.config.js', 'vitest.config.mjs',
      'jest.config.ts', 'jest.config.js', 'jest.config.mjs',
      'cypress.config.ts', 'cypress.config.js', 'cypress.config.json',
      'playwright.config.ts', 'playwright.config.js',
      'package.json', 'tsconfig.json'
    ];

    for (const configFile of configPatterns) {
      const configPath = join(normalizedRoot, configFile);
      if (existsSync(configPath)) {
        try {
          const content = retrySync(() => readFileSync(configPath, 'utf-8'));
          files.push({
            path: configPath,
            content
          });
        } catch (e) {
          trackError('readFile', configPath, e instanceof Error ? e : String(e));
        }
      }
    }

    return files;
  }

  /**
   * Async version of scan - uses non-blocking I/O for better performance
   * on large projects
   */
  async scanAsync(projectRoot: string): Promise<SourceFile[]> {
    const files: SourceFile[] = [];
    const normalizedRoot = normalize(projectRoot);

    // Always add default ignores
    const allIgnorePatterns = [...this.ignorePatterns, 'node_modules', 'dist', 'coverage', '.git'];

    // Scan src directory for source files
    const srcDir = join(normalizedRoot, 'src');
    if (existsSync(srcDir)) {
      await this.scanDirectoryAsync(srcDir, files, this.sourceExtensions, false, normalizedRoot, allIgnorePatterns);
    } else {
      // Fall back to root directory
      await this.scanDirectoryAsync(normalizedRoot, files, this.sourceExtensions, true, normalizedRoot, allIgnorePatterns);
    }

    // Also scan root directory for config files
    const configPatterns = [
      'vitest.config.ts', 'vitest.config.js', 'vitest.config.mjs',
      'jest.config.ts', 'jest.config.js', 'jest.config.mjs',
      'cypress.config.ts', 'cypress.config.js', 'cypress.config.json',
      'playwright.config.ts', 'playwright.config.js',
      'package.json', 'tsconfig.json'
    ];

    for (const configFile of configPatterns) {
      const configPath = join(normalizedRoot, configFile);
      if (existsSync(configPath)) {
        try {
          const content = await retry(() => readFile(configPath, 'utf-8'));
          files.push({
            path: configPath,
            content
          });
        } catch (e) {
          trackError('readFile', configPath, e instanceof Error ? e : String(e));
        }
      }
    }

    return files;
  }

  /**
   * Get file stats (mtime, size) for all source files - used for caching
   */
  getFileStats(projectRoot: string): Map<string, { mtime: number; size: number }> {
    const stats = new Map<string, { mtime: number; size: number }>();
    const normalizedRoot = normalize(projectRoot);
    const allIgnorePatterns = [...this.ignorePatterns, 'node_modules', 'dist', 'coverage', '.git'];

    const srcDir = join(normalizedRoot, 'src');
    if (existsSync(srcDir)) {
      this.collectStats(srcDir, stats, this.sourceExtensions, normalizedRoot, allIgnorePatterns);
    } else {
      this.collectStats(normalizedRoot, stats, this.sourceExtensions, normalizedRoot, allIgnorePatterns);
    }

    return stats;
  }

  /**
   * Async version of getFileStats
   */
  async getFileStatsAsync(projectRoot: string): Promise<Map<string, { mtime: number; size: number }>> {
    const stats = new Map<string, { mtime: number; size: number }>();
    const normalizedRoot = normalize(projectRoot);
    const allIgnorePatterns = [...this.ignorePatterns, 'node_modules', 'dist', 'coverage', '.git'];

    const srcDir = join(normalizedRoot, 'src');
    if (existsSync(srcDir)) {
      await this.collectStatsAsync(srcDir, stats, this.sourceExtensions, normalizedRoot, allIgnorePatterns);
    } else {
      await this.collectStatsAsync(normalizedRoot, stats, this.sourceExtensions, normalizedRoot, allIgnorePatterns);
    }

    return stats;
  }

  private collectStats(
    dir: string,
    stats: Map<string, { mtime: number; size: number }>,
    extensions: string[],
    projectRoot: string,
    ignorePatterns: string[]
  ): void {
    if (!existsSync(dir)) return;

    let entries: string[];
    try {
      entries = retrySync(() => readdirSync(dir));
    } catch (e) {
      trackError('readdirSync', dir, e instanceof Error ? e : String(e));
      return;
    }

    for (const entry of entries) {
      if (entry.startsWith('.')) continue;

      const fullPath = join(dir, entry);
      if (this.shouldIgnore(fullPath, projectRoot, ignorePatterns)) continue;

      let statResult;
      try {
        statResult = retrySync(() => statSync(fullPath));
      } catch (e) {
        trackError('statSync', fullPath, e instanceof Error ? e : String(e));
        continue;
      }

      if (statResult.isDirectory()) {
        this.collectStats(fullPath, stats, extensions, projectRoot, ignorePatterns);
      } else if (statResult.isFile()) {
        const ext = entry.substring(entry.lastIndexOf('.'));
        if (extensions.includes(ext) && this.shouldIncludeFile(ext)) {
          stats.set(fullPath, { mtime: statResult.mtimeMs, size: statResult.size });
        }
      }
    }
  }

  /**
   * Check if a file should be included based on relevant extensions
   */
  private shouldIncludeFile(ext: string): boolean {
    // If no relevant extensions filter, include all
    if (!this.relevantExtensions || this.relevantExtensions.size === 0) {
      return true;
    }
    // Check if extension is in the relevant set
    return this.relevantExtensions.has(ext);
  }

  private async collectStatsAsync(
    dir: string,
    stats: Map<string, { mtime: number; size: number }>,
    extensions: string[],
    projectRoot: string,
    ignorePatterns: string[]
  ): Promise<void> {
    if (!existsSync(dir)) return;

    let entries: string[];
    try {
      entries = await retry(() => readdir(dir));
    } catch (e) {
      trackError('readdir', dir, e instanceof Error ? e : String(e));
      return;
    }

    const promises: Promise<void>[] = [];

    for (const entry of entries) {
      if (entry.startsWith('.')) continue;

      const fullPath = join(dir, entry);
      if (this.shouldIgnore(fullPath, projectRoot, ignorePatterns)) continue;

      const promise = (async () => {
        try {
          const statResult = await retry(() => stat(fullPath));
          if (statResult.isDirectory()) {
            await this.collectStatsAsync(fullPath, stats, extensions, projectRoot, ignorePatterns);
          } else if (statResult.isFile()) {
            const ext = entry.substring(entry.lastIndexOf('.'));
            if (extensions.includes(ext) && this.shouldIncludeFile(ext)) {
              stats.set(fullPath, { mtime: statResult.mtimeMs, size: statResult.size });
            }
          }
        } catch (e) {
          trackError('stat', fullPath, e instanceof Error ? e : String(e));
        }
      })();
      promises.push(promise);
    }

    await Promise.all(promises);
  }

  private async scanDirectoryAsync(
    dir: string,
    files: SourceFile[],
    extensions: string[],
    isRoot: boolean,
    projectRoot: string,
    ignorePatterns: string[]
  ): Promise<void> {
    if (!existsSync(dir)) return;

    let entries: string[];
    try {
      entries = await retry(() => readdir(dir));
    } catch (e) {
      // Track error but continue scanning other directories
      trackError('readdir', dir, e instanceof Error ? e : String(e));
      return;
    }

    // Process entries in parallel for better performance
    const filePromises: Promise<void>[] = [];

    for (const entry of entries) {
      if (entry.startsWith('.')) {
        continue;
      }

      const fullPath = join(dir, entry);

      // Check ignore patterns
      if (this.shouldIgnore(fullPath, projectRoot, ignorePatterns)) {
        continue;
      }

      const promise = (async () => {
        let statResult;
        try {
          statResult = await retry(() => stat(fullPath));
        } catch (e) {
          trackError('stat', fullPath, e instanceof Error ? e : String(e));
          return;
        }

        if (statResult.isDirectory()) {
          await this.scanDirectoryAsync(fullPath, files, extensions, isRoot, projectRoot, ignorePatterns);
        } else if (statResult.isFile()) {
          const ext = entry.substring(entry.lastIndexOf('.'));
          if ((extensions.includes(ext) || (isRoot && (ext === '.ts' || ext === '.js'))) && this.shouldIncludeFile(ext)) {
            try {
              const safeFilePath = safePath(fullPath, projectRoot);
              const content = await retry(() => readFile(safeFilePath, 'utf-8'));
              files.push({
                path: safeFilePath,
                content
              });
            } catch (e) {
              if (e instanceof Error && e.message.includes('path traversal')) {
                console.warn(`Security: ${e.message}`);
              } else {
                trackError('readFile', fullPath, e instanceof Error ? e : String(e));
              }
            }
          }
        }
      })();

      filePromises.push(promise);
    }

    // Wait for all files in this directory to be processed
    await Promise.all(filePromises);
  }

  private shouldIgnore(filePath: string, projectRoot: string, patterns: string[]): boolean {
    const relativePath = projectRoot
      ? filePath.replace(projectRoot, '').replace(/^[/\\]/, '')
      : filePath;

    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        // Simple wildcard matching
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        if (regex.test(relativePath) || regex.test(filePath)) {
          return true;
        }
      } else {
        if (relativePath.includes(pattern) || filePath.includes(pattern)) {
          return true;
        }
      }
    }
    return false;
  }

  private scanDirectory(
    dir: string,
    files: SourceFile[],
    extensions: string[],
    isRoot: boolean,
    projectRoot: string,
    ignorePatterns: string[]
  ): void {
    if (!existsSync(dir)) return;

    let entries: string[];
    try {
      entries = retrySync(() => readdirSync(dir));
    } catch (e) {
      trackError('readdirSync', dir, e instanceof Error ? e : String(e));
      return;
    }

    for (const entry of entries) {
      if (entry.startsWith('.')) {
        continue;
      }

      const fullPath = join(dir, entry);

      // Check ignore patterns
      if (this.shouldIgnore(fullPath, projectRoot, ignorePatterns)) {
        continue;
      }

      let stat;
      try {
        stat = retrySync(() => statSync(fullPath));
      } catch (e) {
        trackError('statSync', fullPath, e instanceof Error ? e : String(e));
        continue;
      }

      if (stat.isDirectory()) {
        this.scanDirectory(fullPath, files, extensions, isRoot, projectRoot, ignorePatterns);
      } else if (stat.isFile()) {
        const ext = entry.substring(entry.lastIndexOf('.'));
        if ((extensions.includes(ext) || (isRoot && (ext === '.ts' || ext === '.js'))) && this.shouldIncludeFile(ext)) {
          try {
            // Security: Validate path is within project
            const safeFilePath = safePath(fullPath, projectRoot);
            const content = retrySync(() => readFileSync(safeFilePath, 'utf-8'));
            files.push({
              path: safeFilePath,
              content
            });
          } catch (e) {
            // Skip files that can't be read or path traversal attempts
            if (e instanceof Error && e.message.includes('path traversal')) {
              console.warn(`Security: ${e.message}`);
            }
          }
        }
      }
    }
  }
}
