import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, readFile, renameSync } from 'fs';
import { join, dirname } from 'path';
import { createHash } from 'crypto';
import { promisify } from 'util';
import { stat } from 'fs/promises';

export interface FileCache {
  [filePath: string]: {
    mtime: number;
    size: number;
    hash?: string;
  };
}

export interface CacheMetadata {
  version: string;
  lastScan: number;
  projectRoot: string;
  // Track package.json to invalidate cache on dependency changes
  packageJsonMtime?: number;
}

export interface ScanCache {
  metadata: CacheMetadata;
  files: FileCache;
  // Store rule results for unchanged files
  ruleResults?: Record<string, {
    findingsCount: number;
    timestamp: number;
  }>;
}

const CACHE_VERSION = '1.0.0';

// Default cache expiration: 24 hours in milliseconds
const DEFAULT_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Cache manager for incremental scans
 * Stores file modification times to avoid re-scanning unchanged files
 */
export class CacheManager {
  private cacheDir: string;
  private cacheFile: string;
  private cache: ScanCache | null = null;
  private enabled: boolean;
  private maxAgeMs: number;

  constructor(projectRoot: string, enabled: boolean = true, maxAgeMs: number = DEFAULT_CACHE_MAX_AGE_MS) {
    this.enabled = enabled;
    this.maxAgeMs = maxAgeMs;
    this.cacheDir = join(projectRoot, '.attune');
    this.cacheFile = join(this.cacheDir, 'cache.json');
  }

  /**
   * Check if cache has expired based on time
   */
  private isExpired(metadata: CacheMetadata): boolean {
    const now = Date.now();
    const age = now - metadata.lastScan;
    return age > this.maxAgeMs;
  }

  /**
   * Check if package.json has changed since last cache
   */
  private hasPackageJsonChanged(metadata: CacheMetadata, projectRoot: string): boolean {
    // If we don't have a package.json mtime stored, assume changed
    if (!metadata.packageJsonMtime) return true;

    try {
      const packageJsonPath = join(projectRoot, 'package.json');
      if (!existsSync(packageJsonPath)) {
        // No package.json now but we cached before, or vice versa - treat as changed
        return metadata.packageJsonMtime > 0;
      }

      const stats = statSync(packageJsonPath);
      return stats.mtimeMs !== metadata.packageJsonMtime;
    } catch {
      // Error reading package.json - assume changed to be safe
      return true;
    }
  }

  /**
   * Load cache from disk with validation
   */
  load(): ScanCache | null {
    if (!this.enabled) return null;

    try {
      if (existsSync(this.cacheFile)) {
        const content = readFileSync(this.cacheFile, 'utf-8');
        const parsed = JSON.parse(content) as ScanCache;

        // Validate cache structure
        if (!this.isValidCache(parsed)) {
          console.log('Cache validation failed, starting fresh scan...');
          this.clear();
          return null;
        }

        this.cache = parsed;
        return this.cache;
      }
    } catch (e) {
      // Cache file is corrupted - clear it and start fresh
      console.log('Cache corrupted, starting fresh scan...');
      this.clear();
    }
    return null;
  }

  /**
   * Validate cache structure
   */
  private isValidCache(cache: unknown): cache is ScanCache {
    if (!cache || typeof cache !== 'object') return false;

    const c = cache as Record<string, unknown>;

    // Check required metadata fields
    if (!c.metadata || typeof c.metadata !== 'object') return false;
    const meta = c.metadata as Record<string, unknown>;
    if (typeof meta.version !== 'string') return false;
    if (typeof meta.lastScan !== 'number') return false;
    if (typeof meta.projectRoot !== 'string') return false;

    // Check files object
    if (!c.files || typeof c.files !== 'object') return false;

    // Version mismatch - cache is incompatible
    if (meta.version !== CACHE_VERSION) return false;

    return true;
  }

  /**
   * Save cache to disk with atomic write
   */
  save(cache: ScanCache): void {
    if (!this.enabled) return;

    try {
      // Ensure cache directory exists
      if (!existsSync(this.cacheDir)) {
        mkdirSync(this.cacheDir, { recursive: true });
      }

      // Write to temp file first, then rename (atomic write)
      const tempFile = this.cacheFile + '.tmp';
      writeFileSync(tempFile, JSON.stringify(cache, null, 2));

      // Atomic rename
      renameSync(tempFile, this.cacheFile);
    } catch (e) {
      // Silently fail if cache can't be written - not critical
      console.warn('Failed to save cache:', e instanceof Error ? e.message : String(e));
    }
  }

  /**
   * Get list of files that have changed since last scan
   */
  getChangedFiles(currentFiles: Map<string, { mtime: number; size: number }>, projectRoot?: string): string[] {
    const cached = this.load();
    if (!cached) return Array.from(currentFiles.keys());

    // Check if cache has expired
    if (this.isExpired(cached.metadata)) {
      if (cached.metadata.lastScan > 0) {
        console.log('Cache expired, performing full scan...');
      }
      return Array.from(currentFiles.keys());
    }

    // Check if package.json has changed (dependencies updated)
    if (projectRoot && this.hasPackageJsonChanged(cached.metadata, projectRoot)) {
      console.log('Dependencies changed, performing full scan...');
      return Array.from(currentFiles.keys());
    }

    const changedFiles: string[] = [];

    for (const [filePath, stats] of currentFiles.entries()) {
      const cachedStats = cached.files[filePath];

      // File is new or modified
      if (!cachedStats || cachedStats.mtime !== stats.mtime || cachedStats.size !== stats.size) {
        changedFiles.push(filePath);
      }
    }

    // Check for deleted files (files in cache but not in current scan)
    for (const cachedFile of Object.keys(cached.files)) {
      if (!currentFiles.has(cachedFile)) {
        // File was deleted, but we don't need to track this for incremental scans
      }
    }

    return changedFiles;
  }

  /**
   * Create a new cache from current file scan
   */
  createCache(projectRoot: string, files: Array<{ path: string; mtime: number; size: number }>): ScanCache {
    const fileCache: FileCache = {};

    // Get package.json mtime for cache invalidation
    let packageJsonMtime = 0;
    try {
      const packageJsonPath = join(projectRoot, 'package.json');
      if (existsSync(packageJsonPath)) {
        const stats = statSync(packageJsonPath);
        packageJsonMtime = stats.mtimeMs;
      }
    } catch {
      // Ignore - package.json might not exist
    }

    for (const file of files) {
      fileCache[file.path] = {
        mtime: file.mtime,
        size: file.size
      };
    }

    return {
      metadata: {
        version: CACHE_VERSION,
        lastScan: Date.now(),
        projectRoot,
        packageJsonMtime
      },
      files: fileCache
    };
  }

  /**
   * Get cached rule results for unchanged files
   */
  getCachedRuleResults(): Record<string, { findingsCount: number; timestamp: number }> | undefined {
    return this.cache?.ruleResults;
  }

  /**
   * Update rule results in cache
   */
  updateRuleResults(ruleResults: Record<string, { findingsCount: number; timestamp: number }>): void {
    if (!this.cache) return;
    this.cache.ruleResults = ruleResults;
    this.save(this.cache);
  }

  /**
   * Check if a specific file has changed
   */
  hasFileChanged(filePath: string, currentMtime: number, currentSize: number): boolean {
    const cached = this.load();
    if (!cached) return true;

    // Also check expiration
    if (this.isExpired(cached.metadata)) return true;

    const cachedStats = cached.files[filePath];
    if (!cachedStats) return true;

    return cachedStats.mtime !== currentMtime || cachedStats.size !== currentSize;
  }

  /**
   * Clear the cache
   */
  clear(): void {
    if (!this.enabled) return;

    try {
      if (existsSync(this.cacheFile)) {
        // Delete just the cache file, keep the directory
        writeFileSync(this.cacheFile, JSON.stringify({ metadata: { version: CACHE_VERSION, lastScan: 0, projectRoot: '' }, files: {} }));
      }
    } catch {
      // Ignore errors
    }
  }
}
