import { readFileSync, existsSync } from 'fs';
import { join, normalize } from 'path';
import { Finding, CliOptions, AnalysisContext, Framework, SourceFile, ScanResult, RuleResult } from '../../types/index.js';
import { FrameworkDetector } from '../detector/index.js';
import { RuleRegistry } from '../../rules/index.js';
import { FileScanner, DefaultFileScanner } from '../scanner/index.js';
import { CacheManager } from '../cache/index.js';

// Maximum findings to report per rule - prevents overwhelming reports
// Users can use .attuneignore to suppress specific rules
// Can be overridden via --max-findings CLI option
const DEFAULT_MAX_FINDINGS_PER_RULE = 10;

// Number of rules to run in parallel (balance between speed and system load)
const PARALLEL_RULE_BATCH_SIZE = 10;

export interface AnalyzerOptions {
  scanner?: FileScanner;
  cacheManager?: CacheManager;
}

export class AttuneAnalyzer {
  private projectRoot: string;
  private framework: Framework;
  private options: CliOptions;
  private detector: FrameworkDetector;
  private registry: RuleRegistry;
  private scanner: FileScanner;
  private ignorePatterns: string[] = [];
  private cacheManager?: CacheManager;

  constructor(projectRoot: string, framework: Framework, options: CliOptions, analyzerOptions: AnalyzerOptions = {}) {
    // Normalize project root to prevent path traversal
    this.projectRoot = normalize(projectRoot);
    this.loadIgnorePatterns();
    this.framework = framework;
    this.options = options;
    this.detector = new FrameworkDetector(this.projectRoot);
    this.registry = new RuleRegistry();
    // Initialize cache manager
    this.cacheManager = analyzerOptions.cacheManager;

    // Get relevant file extensions from rules for pre-filtering
    const relevantExtensions = this.registry.getRelevantExtensions(framework, options);

    // Use injected scanner or default
    this.scanner = analyzerOptions.scanner || new DefaultFileScanner({
      ignorePatterns: this.ignorePatterns,
      cacheManager: this.cacheManager,
      relevantExtensions
    });
  }

  async analyze(): Promise<ScanResult> {
    const packageJson = this.detector.getPackageJson();

    // Get file stats for caching (before scanning files)
    let fileStats: Map<string, { mtime: number; size: number }> | undefined;
    if (this.cacheManager && typeof this.scanner.getFileStatsAsync === 'function') {
      fileStats = await this.scanner.getFileStatsAsync(this.projectRoot);
    } else if (this.cacheManager && typeof this.scanner.getFileStats === 'function') {
      fileStats = this.scanner.getFileStats(this.projectRoot);
    }

    // Check for changed files
    let changedFiles: Set<string> | undefined;
    if (this.cacheManager && fileStats) {
      const changedFilePaths = this.cacheManager.getChangedFiles(fileStats, this.projectRoot);
      changedFiles = new Set(changedFilePaths);
      if (changedFilePaths.length > 0 && changedFilePaths.length < (fileStats?.size || 0)) {
        console.log(`Cache: ${changedFilePaths.length} of ${fileStats.size} files changed, re-scanning...`);
      }
    }

    // Use async scanner if available, otherwise fall back to sync
    let files: SourceFile[];
    if (typeof this.scanner.scanAsync === 'function') {
      files = await this.scanner.scanAsync(this.projectRoot);
    } else {
      files = this.scanner.scan(this.projectRoot);
    }

    // For incremental analysis: filter files to only changed ones if caching is enabled
    // This allows rules to process only changed files
    let filesToAnalyze = files;
    if (changedFiles && changedFiles.size > 0 && changedFiles.size < files.length) {
      filesToAnalyze = files.filter(f => changedFiles!.has(f.path));
      console.log(`Incremental: Analyzing ${filesToAnalyze.length} changed files (${files.length - filesToAnalyze.length} files cached)`);
    }

    const context: AnalysisContext = {
      projectRoot: this.projectRoot,
      framework: this.framework,
      files: filesToAnalyze,
      packageJson,
      options: this.options
    };

    // Determine which rules to run based on options
    const rules = this.registry.getRulesForFramework(
      this.framework,
      this.options
    );

    const findings: Finding[] = [];
    const ruleResults: RuleResult[] = [];

    // Run rules in parallel batches for better performance
    for (let i = 0; i < rules.length; i += PARALLEL_RULE_BATCH_SIZE) {
      const batch = rules.slice(i, i + PARALLEL_RULE_BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (rule) => {
          let ruleStartTime: number;
          try {
            // Track rule execution time
            ruleStartTime = Date.now();

        // Check for rule-level errors (e.g., invalid patterns)
        const ruleErrors: string[] = [];
        if ('getErrors' in rule && typeof rule.getErrors === 'function') {
          const errors = (rule as { getErrors(): string[] }).getErrors();
          if (errors.length > 0) {
            ruleErrors.push(...errors);
          }
        }

        const allRuleFindings = rule.detect(context);
        const totalCount = allRuleFindings.length;
        const ruleDurationMs = Date.now() - ruleStartTime;

        // Sort findings deterministically: by file path, then by line number
        // This ensures consistent "top" findings across runs
        const sortedFindings = allRuleFindings.sort((a, b) => {
          if (a.file !== b.file) return a.file.localeCompare(b.file);
          return a.line - b.line;
        });

        // Limit findings per rule to prevent overwhelming reports
        // Report total count so users know the full scope
        const maxFindings = this.options.maxFindings || DEFAULT_MAX_FINDINGS_PER_RULE;
        const limitedFindings = sortedFindings.slice(0, maxFindings);
        if (totalCount > maxFindings) {
          console.warn(`Rule ${rule.id}: ${totalCount} findings, showing top ${maxFindings}. Use .attuneignore to suppress.`);
        }

        // Track rule result
        const ruleResult: RuleResult = {
          id: rule.id,
          name: rule.name,
          category: rule.category,
          severity: rule.severity,
          passed: totalCount === 0 && ruleErrors.length === 0,
          findingsCount: totalCount,
          durationMs: ruleDurationMs,
          error: ruleErrors.length > 0 ? ruleErrors.join('; ') : undefined
        };

        // Log rule errors to console with actionable guidance
        if (ruleErrors.length > 0) {
          console.warn(`⚠️  Rule ${rule.id} has configuration issues:`);
          for (const err of ruleErrors) {
            // Add context to common error types
            let enhancedMsg = err;
            if (err.includes('Invalid regex')) {
              enhancedMsg = `${err}. Check pattern syntax at regex101.com`;
            } else if (err.includes('Invalid exclude')) {
              enhancedMsg = `${err}. Check exclude pattern syntax`;
            }
            console.warn(`  • ${enhancedMsg}`);
          }
          console.warn(`  → This rule may produce incomplete results. Consider fixing or disabling.`);
        }

        // Return results instead of pushing to array
        return { findings: limitedFindings, ruleResult };
      } catch (error) {
        // Track how long the rule ran before failing (if it started)
        const ruleDurationMs = ruleStartTime ? Date.now() - ruleStartTime : 0;

        // Log error with actionable guidance, but continue with other rules
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;

        // Categorize error and provide helpful suggestions
        let suggestion = '';
        if (errorMsg.includes('ENOENT') || errorMsg.includes('file not found')) {
          suggestion = 'Check if the file was deleted or moved.';
        } else if (errorMsg.includes('permission denied') || errorMsg.includes('EACCES')) {
          suggestion = 'Check file permissions.';
        } else if (errorMsg.includes('timeout') || errorMsg.includes('ETIMEDOUT')) {
          suggestion = 'File may be too large or system under load. Try again later.';
        } else if (errorMsg.includes('regex') || errorMsg.includes('RegExp')) {
          suggestion = 'Check rule patterns for syntax errors. Run with --verbose for details.';
        } else {
          suggestion = 'This may be a bug in the rule. Please report if this persists.';
        }

        console.error(`Error running rule ${rule.id}: ${errorMsg}`);
        console.error(`  → ${suggestion}`);

        // In verbose mode, show stack trace for debugging
        if (this.options.verbose && errorStack) {
          console.error('Stack trace:', errorStack);
        }

        // Mark as failed with error message
        return {
          findings: [],
          ruleResult: {
            id: rule.id,
            name: rule.name,
            category: rule.category,
            severity: rule.severity,
            passed: false,
            findingsCount: 0,
            durationMs: ruleDurationMs,
            error: `${errorMsg} ${suggestion ? `(${suggestion})` : ''}`
          }
        };
      }
    })
  );

    // Collect results from batch
    for (const result of batchResults) {
      if (result) {
        findings.push(...result.findings);
        ruleResults.push(result.ruleResult);
      }
    }
  }

    // Save cache after successful scan
    if (this.cacheManager && fileStats) {
      const filesArray = Array.from(fileStats.entries()).map(([path, stats]) => ({
        path,
        mtime: stats.mtime,
        size: stats.size
      }));
      const cache = this.cacheManager.createCache(this.projectRoot, filesArray);
      // Also save rule results for future use
      const ruleResultsMap: Record<string, { findingsCount: number; timestamp: number }> = {};
      for (const result of ruleResults) {
        ruleResultsMap[result.id] = {
          findingsCount: result.findingsCount,
          timestamp: Date.now()
        };
      }
      cache.ruleResults = ruleResultsMap;
      this.cacheManager.save(cache);
    }

    return {
      findings,
      filesScanned: files.length,
      ruleResults
    };
  }

  private loadIgnorePatterns(): void {
    const ignoreFile = join(this.projectRoot, '.attuneignore');
    if (existsSync(ignoreFile)) {
      try {
        const content = readFileSync(ignoreFile, 'utf-8');
        this.ignorePatterns = content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#'));
      } catch {
        // Ignore file read errors
      }
    }

    // Always add default ignores
    this.ignorePatterns.push('node_modules', 'dist', 'coverage', '.git');
  }
}
