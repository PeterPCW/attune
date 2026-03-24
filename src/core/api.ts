import { resolve } from 'path';
import { existsSync, statSync } from 'fs';
import { FrameworkDetector } from '../core/detector/index.js';
import { AttuneAnalyzer } from '../core/analyzer/index.js';
import { CacheManager } from '../core/cache/index.js';
import { sanitizeFindings, sanitizeMetadata } from '../core/sanitizer.js';
import { CliOptions, ScanMetadata, Framework, ProjectType, ScanResult } from '../types/index.js';

export interface AnalyzeOptions {
  framework?: Framework;
  projectType?: ProjectType;
  cache?: boolean;
  maxFindings?: number;
  maxFileSize?: number;
  verbose?: boolean;
  // Filtering options
  security?: boolean;
  architecture?: boolean;
  performance?: boolean;
  testing?: boolean;
  lite?: boolean;
  full?: boolean;
  // Output options
  json?: boolean;
  html?: boolean;
  markdown?: boolean;
  sarif?: boolean;
  explain?: boolean;
  publicSafe?: boolean;
  silentSecurity?: boolean;
  noPaths?: boolean;
  redactSecrets?: boolean;
}

export interface AnalyzeResult {
  findings: ReturnType<typeof sanitizeFindings>;
  metadata: ScanMetadata;
  scanResult: ScanResult;
}

/**
 * Pure analysis function - no CLI-specific logic
 * Can be used programmatically or via CLI
 */
export async function analyzeProject(
  projectPath: string,
  options: AnalyzeOptions
): Promise<AnalyzeResult> {
  // Normalize path
  const projectRoot = resolve(process.cwd(), projectPath);

  // Validate path exists
  if (!existsSync(projectRoot)) {
    throw new Error(`Path does not exist: ${projectPath}`);
  }

  // Validate it's a directory
  const stats = statSync(projectRoot);
  if (!stats.isDirectory()) {
    throw new Error(`Path is not a directory: ${projectPath}`);
  }

  // Map AnalyzeOptions to CliOptions for internal use
  const cliOptions: CliOptions = {
    framework: options.framework,
    projectType: options.projectType,
    cache: options.cache,
    maxFindings: options.maxFindings,
    maxFileSize: options.maxFileSize,
    verbose: options.verbose,
    security: options.security,
    architecture: options.architecture,
    performance: options.performance,
    testing: options.testing,
    lite: options.lite,
    full: options.full,
    json: options.json,
    html: options.html,
    markdown: options.markdown,
    sarif: options.sarif,
    explain: options.explain,
    publicSafe: options.publicSafe,
    silentSecurity: options.silentSecurity,
    noPaths: options.noPaths,
    redactSecrets: options.redactSecrets,
  };

  // Auto-detect framework if not specified
  let framework: Framework;
  if (options.framework) {
    framework = options.framework;
  } else {
    const detector = new FrameworkDetector(projectRoot);
    framework = detector.detect();
  }

  // Auto-detect project type if not specified
  let projectType: ProjectType | undefined;
  if (options.projectType) {
    projectType = options.projectType;
  } else {
    const detector = new FrameworkDetector(projectRoot);
    projectType = detector.detectProjectType();
  }
  cliOptions.projectType = projectType;

  // Initialize cache if enabled
  const cacheManager = options.cache ? new CacheManager(projectRoot, true) : undefined;

  // Create analyzer
  const analyzer = new AttuneAnalyzer(projectRoot, framework, cliOptions, { cacheManager });

  // Run analysis
  const startTime = Date.now();
  const scanResult = await analyzer.analyze();
  const scanTime = Date.now() - startTime;

  // Sanitize findings
  const sanitizedFindings = sanitizeFindings(scanResult.findings, projectRoot, cliOptions);

  // Create metadata
  const metadata: ScanMetadata = {
    projectRoot,
    framework,
    scanTime,
    filesScanned: scanResult.filesScanned,
    rulesRun: scanResult.ruleResults?.length || 0,
    full: !!options.full,
    ruleResults: scanResult.ruleResults
  };

  const sanitizedMetadata = sanitizeMetadata(metadata, cliOptions);

  return {
    findings: sanitizedFindings,
    metadata: sanitizedMetadata,
    scanResult
  };
}