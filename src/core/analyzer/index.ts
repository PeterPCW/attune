import { readFileSync, existsSync } from 'fs';
import { join, normalize } from 'path';
import { Finding, CliOptions, AnalysisContext, Framework, ProjectType, Language, SourceFile, ScanResult, RuleResult } from '../../types/index.js';
import { FrameworkDetector } from '../detector/index.js';
import { EngineRuleRegistry } from '../../rules/engine-registry.js';
import { FileScanner, DefaultFileScanner } from '../scanner/index.js';
import { CacheManager } from '../cache/index.js';
import { IFrameworkDetector } from '../interfaces.js';

/**
 * Simple glob pattern matching for file paths
 * Supports wildcards like double-asterisk for directories
 */
function matchesGlob(path: string, pattern: string): boolean {
  // Normalize path to forward slashes for consistent matching
  const normalizedPath = path.replace(/\\/g, '/');
  const normalizedPattern = pattern.replace(/\\/g, '/');

  // Exact match (already works)
  if (normalizedPath === normalizedPattern || normalizedPath.endsWith(normalizedPattern)) {
    return true;
  }

  // Check if pattern contains glob characters
  if (!normalizedPattern.includes('*')) {
    return false;
  }

  // Convert glob to regex
  // ** matches any directory path
  // * matches any characters in a single path segment
  const regexPattern = normalizedPattern
    .replace(/\.\*\*/g, '([/\\\\].*)?')  // ** -> optional directory segment
    .replace(/\*/g, '[^/\\\\]+');        // * -> any non-path characters
  const regex = new RegExp('^' + regexPattern + '$');

  return regex.test(path);
}

export interface AnalyzerOptions {
  scanner?: FileScanner;
  cacheManager?: CacheManager;
  detector?: IFrameworkDetector;
}

export class AttuneAnalyzer {
  private projectRoot: string;
  private framework: Framework;
  private projectType: ProjectType;
  private language: Language;
  private options: CliOptions;
  private detector: IFrameworkDetector;
  private engineRegistry: EngineRuleRegistry;
  private scanner: FileScanner;
  private ignorePatterns: string[] = [];
  // Rule-specific ignores: { ruleId: string, pattern: string }[]
  // Format in .attuneignore: "RULE_ID:path" or "RULE_ID path"
  private ruleSpecificIgnores: Array<{ ruleId: string; pattern: string }> = [];
  private cacheManager?: CacheManager;

  constructor(projectRoot: string, framework: Framework, options: CliOptions, analyzerOptions: AnalyzerOptions = {}) {
    // Normalize project root to prevent path traversal
    this.projectRoot = normalize(projectRoot);
    this.loadIgnorePatterns();
    this.framework = framework;
    this.options = options;
    // Use injected detector or create default (dependency injection for testability)
    this.detector = analyzerOptions.detector || new FrameworkDetector(this.projectRoot);
    // Detect project type for smart rule filtering (CLI override takes precedence)
    this.projectType = options.projectType || this.detector.detectProjectType();

    // Detect language for smart rule filtering (Python rules shouldn't run on TypeScript projects)
    this.language = this.detector.detectLanguage();

    // Always use json-function-engine for rule execution
    this.engineRegistry = new EngineRuleRegistry({ logger: options.verbose ? 'verbose' : 'silent' });

    // Initialize cache manager
    this.cacheManager = analyzerOptions.cacheManager;

    // Get relevant file extensions from rules for pre-filtering
    const relevantExtensions = this.engineRegistry.getRelevantExtensions(framework, options, this.projectType);

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
        console.log(`📦 Cache: ${changedFilePaths.length} of ${fileStats.size} files changed, re-scanning...`);
      } else if (changedFilePaths.length === 0 && fileStats.size > 0) {
        console.log(`📦 Cache: Using cached results (${fileStats.size} files unchanged)`);
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
      console.log(`📦 Incremental: Analyzing ${filesToAnalyze.length} changed files (${files.length - filesToAnalyze.length} files cached)`);
    }

    const context: AnalysisContext = {
      projectRoot: this.projectRoot,
      framework: this.framework,
      projectType: this.projectType,
      files: filesToAnalyze,
      packageJson,
      options: this.options
    };

    // Execute all rules using json-function-engine
    const findings = await this.engineRegistry.executeAll(
      files,
      this.framework,
      this.options,
      this.projectType,
      this.language
    );

    // Filter out rule-specific ignores (e.g., "RULE_ID:path/to/file")
    const filteredFindings = findings.filter(f => !this.shouldIgnoreFinding(f));

    // Get all rules that were executed (from the engine registry)
    const allRulesExecuted = await this.engineRegistry.getRulesForFramework(
      this.framework,
      this.options,
      this.projectType,
      this.language
    );
    const executedRuleIds = new Set(allRulesExecuted.map(r => r.id));

    // Build rule results - include ALL executed rules, mark passed if no findings
    const ruleResults: RuleResult[] = [];
    const ruleMap = new Map<string, RuleResult>();

    // First, add all rules that were executed with passed: true
    for (const rule of allRulesExecuted) {
      ruleMap.set(rule.id, {
        id: rule.id,
        name: rule.name || rule.id,
        category: rule.category || 'unknown',
        severity: rule.severity || 'medium',
        passed: true,
        findingsCount: 0,
        durationMs: 0,
      });
    }

    // Then, update with actual findings (mark as failed)
    for (const finding of filteredFindings) {
      const ruleId = finding.ruleId;
      if (!ruleMap.has(ruleId)) {
        // Rule not in our executed list - add it
        ruleMap.set(ruleId, {
          id: ruleId,
          name: finding.message.split(':')[0] || ruleId,
          category: finding.category || 'unknown',
          severity: finding.severity,
          passed: false,
          findingsCount: 0,
          durationMs: 0,
        });
      }
      const ruleResult = ruleMap.get(ruleId)!;
      ruleResult.passed = false;
      ruleResult.findingsCount++;
    }

    ruleResults.push(...ruleMap.values());

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
      findings: filteredFindings,
      ruleResults,
      framework: this.framework,
      projectType: this.projectType,
      filesScanned: files.length,
    };
  }

  private loadIgnorePatterns(): void {
    const ignoreFile = join(this.projectRoot, '.attuneignore');
    if (existsSync(ignoreFile)) {
      try {
        const content = readFileSync(ignoreFile, 'utf-8');
        const lines = content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#'));

        for (const line of lines) {
          // Check for rule-specific ignore format: "RULE_ID:path" or "RULE_ID path"
          const colonIndex = line.indexOf(':');
          if (colonIndex > 0) {
            const ruleId = line.substring(0, colonIndex).trim();
            const pattern = line.substring(colonIndex + 1).trim();
            if (ruleId && pattern) {
              this.ruleSpecificIgnores.push({ ruleId, pattern });
              continue;
            }
          }
          // Regular ignore pattern
          this.ignorePatterns.push(line);
        }
      } catch {
        // Ignore file read errors
      }
    }

    // Always add default ignores
    this.ignorePatterns.push('node_modules', 'dist', 'coverage', '.git');
  }

  // Check if a finding should be ignored due to rule-specific ignore
  private shouldIgnoreFinding(finding: Finding): boolean {
    // Normalize file path
    const normalizedPath = finding.file.replace(/\\/g, '/');

    for (const ignore of this.ruleSpecificIgnores) {
      if (ignore.ruleId !== finding.ruleId) continue;
      // Glob pattern matching: supports **/*.ext, *.ext, path/**/*.ext
      const pattern = ignore.pattern;
      if (matchesGlob(normalizedPath, pattern)) {
        return true;
      }
    }
    return false;
  }
}
