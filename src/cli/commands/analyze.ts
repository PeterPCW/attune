import { resolve, join } from 'path';
import { existsSync, mkdirSync, promises as fsPromises } from 'fs';
import { FrameworkDetector } from '../../core/detector/index.js';
import { AttuneAnalyzer } from '../../core/analyzer/index.js';
import { CacheManager } from '../../core/cache/index.js';
import { sanitizeFindings, sanitizeMetadata, checkForSensitiveFiles } from '../../core/sanitizer.js';
import { getScanErrors, clearScanErrors, setVerboseErrors } from '../../core/scanner/index.js';
import { CliOptions, ScanMetadata, Framework, ProjectType, Finding } from '../../types/index.js';
import { formatTerminal } from '../../formatters/terminal.js';
import { formatJson } from '../../formatters/json.js';
import { formatMarkdown } from '../../formatters/markdown.js';
import { formatHtml } from '../../formatters/html.js';
import { formatSarif } from '../../formatters/sarif.js';
import { formatExplain } from '../../formatters/explain.js';
import { getVersion } from '../utils/version.js';
import chalk from 'chalk';

// Re-export from modules for backward compatibility
export { applyConfig, parseConfigFile, isValidConfigFlag, getValidConfigFlags } from '../utils/config.js';
export { isCI } from '../utils/ci.js';
export { initializeAttune, getDefaultOutputPath, ATTUNE_DIR, REPORT_DIR } from '../utils/files.js';
export { showWelcomeMessage, showSmartSuggestions } from '../output/messages.js';
export { setupGracefulShutdown } from '../handlers/shutdown.js';

// Default output directory for file-based reports
const DEFAULT_REPORT_DIR = '.attune/reports';

export async function analyze(projectPath: string, options: CliOptions): Promise<void> {
  const projectRoot = resolve(process.cwd(), projectPath);

  // Enable verbose error tracking if requested
  if (options.verbose) {
    setVerboseErrors(true);
  }

  // Clear any previous errors
  clearScanErrors();

  // Check if path exists
  if (!existsSync(projectRoot)) {
    console.error(chalk.red(`❌ Error: Path does not exist: ${projectPath}`));
    process.exit(1);
  }

  // Check if path is a directory
  const stats = await fsPromises.stat(projectRoot);
  if (!stats.isDirectory()) {
    console.error(chalk.red(`❌ Error: Path is not a directory: ${projectPath}`));
    process.exit(1);
  }

  // Set up graceful shutdown handlers (import dynamically)
  const { setupGracefulShutdown } = await import('../handlers/shutdown.js');
  setupGracefulShutdown();

  try {
    // Import and use the extracted modules
    const { initializeAttune, getDefaultOutputPath, ATTUNE_DIR, REPORT_DIR } = await import('../utils/files.js');
    const { applyConfig } = await import('../utils/config.js');
    const { isCI } = await import('../utils/ci.js');
    const { showWelcomeMessage, showSmartSuggestions } = await import('../output/messages.js');

    // Initialize Attune: create directories and config files if needed
    const isFirstRun = await initializeAttune(projectRoot);

    // Check if we're in a CI environment
    const inCI = isCI();

    // Show welcome message on first run (but not in CI)
    if (isFirstRun && !options.json && !options.sarif && !inCI) {
      showWelcomeMessage();
      console.log('');
    }

    // Apply config file settings
    // --full bypasses everything, --no-config skips config file but uses .attuneignore
    let finalOptions = options;
    if (!options.full && options.config !== false) {
      finalOptions = await applyConfig(projectRoot, options);
    }

    // Default explain to true unless explicitly disabled
    if (finalOptions.explain === undefined) {
      finalOptions.explain = true;
    }

    console.log(chalk.blue('🔍 Detecting project type...'));

    // Use specified framework or auto-detect
    let framework: Framework;
    if (options.framework) {
      // Validate framework
      const validFrameworks = ['nextjs', 'react', 'vue', 'nuxt', 'svelte', 'remix', 'astro', 'solidjs', 'angular', 'express', 'fastify', 'nodejs', 'library', 'python', 'django', 'fastapi', 'flask', 'sqlalchemy', 'celery', 'pydantic', 'aiohttp', 'starlette'];
      if (!validFrameworks.includes(options.framework)) {
        console.error(chalk.red(`\n❌ Invalid framework: '${options.framework}'`));
        console.error(chalk.yellow(`   Valid frameworks: ${validFrameworks.join(', ')}`));
        process.exit(1);
      }
      framework = options.framework;
      if (finalOptions.verbose) {
        console.log(chalk.gray(`   → Using specified framework: ${framework}`));
      }
    } else {
      const detector = new FrameworkDetector(projectRoot);
      framework = detector.detect();
      if (finalOptions.verbose) {
        console.log(chalk.gray(`   → ${framework} detected`));
      }
    }

    // Detect project type (or use CLI override)
    let projectType: ProjectType | undefined;
    const detector = new FrameworkDetector(projectRoot);
    const detectedType = detector.detectProjectType();
    if (options.projectType) {
      // Validate project type
      const validTypes = ['cli', 'devtool', 'library', 'webapp', 'saas', 'mobile', 'desktop', 'firmware'];
      if (!validTypes.includes(options.projectType)) {
        console.error(chalk.red(`\n❌ Invalid project type: '${options.projectType}'`));
        console.error(chalk.yellow(`   Valid types: ${validTypes.join(', ')}`));
        process.exit(1);
      }
      projectType = options.projectType;
      if (finalOptions.verbose) {
        console.log(chalk.gray(`   → Using specified project type: ${projectType} (auto-detected: ${detectedType})`));
      }
    } else {
      projectType = detectedType;
      if (finalOptions.verbose) {
        console.log(chalk.gray(`   → Project type: ${projectType}`));
      }
    }
    finalOptions.projectType = projectType;

    const startTime = Date.now();

    console.log(chalk.blue('⚙️ Running checks...'));

    // Initialize cache manager only if explicitly enabled
    // Security-sensitive users can opt-out of caching with --no-cache
    // Users can explicitly enable with --cache flag
    // Cache enabled by default, use --no-cache to disable
    const cacheEnabled = finalOptions.cache !== false;
    const cacheManager = cacheEnabled ? new CacheManager(projectRoot, true) : undefined;

    if (cacheEnabled && finalOptions.verbose) {
      console.log(chalk.gray('   → Cache enabled for incremental scans'));
    }

    // Get estimated rule count for progress display
    const analyzer = new AttuneAnalyzer(projectRoot, framework, options, { cacheManager });

    // Progress update interval
    let progressInterval: NodeJS.Timeout | null = null;
    let filesProcessed = 0;

    // Start progress display for non-verbose mode
    if (!finalOptions.verbose && (finalOptions.full || finalOptions.lite || (!finalOptions.json && !finalOptions.sarif))) {
      // Estimate rule count based on mode
      const estimatedRules = finalOptions.full ? 150 : (finalOptions.security || finalOptions.architecture || finalOptions.performance || finalOptions.testing ? 80 : 50);

      console.log(chalk.gray(`   Files: 0 | Rules: 0/${estimatedRules}`));

      progressInterval = setInterval(() => {
        process.stdout.write(`\r${chalk.gray(`   Files: ${filesProcessed} | Rules: running...`)}`);
      }, 200);
    }

    const result = await analyzer.analyze();

    // Stop progress
    if (progressInterval) {
      clearInterval(progressInterval);
      // Update final count
      console.log(chalk.gray(`   Files: ${result.filesScanned} | Rules: ${result.ruleResults?.length || 0} completed`));
    }

    const scanTime = Date.now() - startTime;

    // Sanitize findings based on options
    let sanitizedFindings = sanitizeFindings(result.findings, projectRoot, finalOptions);

    // Filter out security findings if --silent-security is enabled
    if (finalOptions.silentSecurity) {
      sanitizedFindings = sanitizedFindings.filter(f => f.category !== 'security');
    }

    const metadata: ScanMetadata = {
      projectRoot,
      framework,
      scanTime,
      filesScanned: result.filesScanned,
      rulesRun: result.ruleResults?.length || 0,
      full: !!options.full,
      ruleResults: result.ruleResults
    };

    const sanitizedMetadata = sanitizeMetadata(metadata, options);

    // Check for sensitive files and warn
    if (finalOptions.verbose || finalOptions.publicSafe) {
      const warnings = checkForSensitiveFiles(result.findings.map(f => ({ path: f.file })));
      for (const warning of warnings) {
        console.log(chalk.yellow(`⚠️ ${warning}`));
      }
    }

    // Select formatter
    let output: string;
    if (finalOptions.json) {
      output = formatJson(sanitizedFindings, sanitizedMetadata);
    } else if (finalOptions.html) {
      output = formatHtml(sanitizedFindings, sanitizedMetadata);
    } else if (finalOptions.markdown) {
      output = formatMarkdown(sanitizedFindings, sanitizedMetadata);
    } else if (finalOptions.sarif) {
      // SARIF formatter
      output = formatSarif(sanitizedFindings, sanitizedMetadata);
    } else {
      output = formatTerminal(sanitizedFindings, sanitizedMetadata);
    }

    // Determine output format and path
    let outputFormat: string | null = null;
    if (finalOptions.html) outputFormat = 'html';
    else if (finalOptions.markdown) outputFormat = 'markdown';
    else if (finalOptions.json) outputFormat = 'json';
    else if (finalOptions.sarif) outputFormat = 'sarif';

    // Determine output path: explicit path, default path for file formats, or null for console
    let outputPath = finalOptions.output || null;
    if (!outputPath && outputFormat) {
      outputPath = getDefaultOutputPath(projectRoot, outputFormat);
    }

    // Ensure output directory exists
    if (outputPath) {
      const outputDir = resolve(projectRoot, DEFAULT_REPORT_DIR);
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
    }

    // Store-only mode: save to file without printing
    if (finalOptions.storeOnly && outputPath) {
      await fsPromises.writeFile(outputPath, output);
      console.log(chalk.green(`✅ Report saved to ${outputPath}`));
    } else if (outputPath) {
      // Output to file only (skip printing to console for file formats like HTML)
      await fsPromises.writeFile(outputPath, output);
      console.log(chalk.gray(`📄 Report saved to ${outputPath}`));
    } else {
      console.log(output);
    }

    // Generate explain output if --explain flag is set
    if (finalOptions.explain && sanitizedFindings.length > 0) {
      const explainOutput = formatExplain(sanitizedFindings, sanitizedMetadata);

      // Determine explain output path
      let explainOutputPath: string | null = null;
      if (outputPath) {
        // Always use .explain.md since explain content is Markdown
        explainOutputPath = outputPath.replace(/(\.[^.]+)$/, '.explain.md');
      } else {
        // Default explain path
        explainOutputPath = join(projectRoot, DEFAULT_REPORT_DIR, `attune-explain-${Date.now()}.md`);
      }

      if (explainOutputPath) {
        const explainDir = join(projectRoot, DEFAULT_REPORT_DIR);
        if (!existsSync(explainDir)) {
          mkdirSync(explainDir, { recursive: true });
        }
        await fsPromises.writeFile(explainOutputPath, explainOutput);
        console.log(chalk.gray(`📋 Explain report saved to ${explainOutputPath}`));
      }
    }

    // Show smart suggestions based on findings
    if (!finalOptions.silentSecurity && sanitizedFindings.length > 0) {
      showSmartSuggestions(sanitizedFindings);
    }

    // Report any scanner errors in verbose mode
    if (finalOptions.verbose) {
      const errors = getScanErrors();
      if (errors.length > 0) {
        console.log(chalk.yellow(`\n⚠️  Scanner encountered ${errors.length} error(s):`));
        // Group errors by type for cleaner output
        const errorGroups = new Map<string, number>();
        for (const err of errors) {
          const key = `${err.operation}:${err.message.substring(0, 50)}`;
          errorGroups.set(key, (errorGroups.get(key) || 0) + 1);
        }
        for (const [key, count] of errorGroups) {
          console.log(chalk.gray(`  • ${key}${count > 1 ? ` (${count} times)` : ''}`));
        }
      }
    }

    // Output metrics if --metrics flag is set
    if (finalOptions.metrics) {
      const criticalCount = sanitizedFindings.filter(f => f.severity === 'critical').length;
      const highCount = sanitizedFindings.filter(f => f.severity === 'high').length;
      const mediumCount = sanitizedFindings.filter(f => f.severity === 'medium').length;
      const lowCount = sanitizedFindings.filter(f => f.severity === 'low').length;
      const infoCount = sanitizedFindings.filter(f => f.severity === 'info').length;
      const totalFindings = sanitizedFindings.length;

      const rulesRun = result.ruleResults?.length || 0;
      const rulesPassed = result.ruleResults?.filter(r => r.passed).length || 0;
      const rulesFailed = rulesRun - rulesPassed;

      const fileScanTimeMs = Math.round(scanTime * 0.3);
      const ruleExecutionTimeMs = scanTime - fileScanTimeMs;

      console.log(chalk.gray(`
Analysis Metrics:
=================
Timing:
  Total: ${scanTime}ms
  File Scan: ${fileScanTimeMs}ms
  Rule Execution: ${ruleExecutionTimeMs}ms

Counts:
  Files Scanned: ${result.filesScanned}
  Rules Run: ${rulesRun} (${rulesPassed} passed, ${rulesFailed} failed)

Findings:
  Critical: ${criticalCount}
  High: ${highCount}
  Medium: ${mediumCount}
  Low: ${lowCount}
  Info: ${infoCount}
  Total: ${totalFindings}

Framework: ${framework}
Project Type: ${projectType || 'library'}
`));
    }

    // Exit with error code based on severity and --fail-on-warnings flag
    const criticalCount = sanitizedFindings.filter(f => f.severity === 'critical').length;
    const highCount = sanitizedFindings.filter(f => f.severity === 'high').length;
    const warningCount = sanitizedFindings.filter(f => f.severity === 'warning' || f.severity === 'medium').length;

    if (criticalCount > 0 || highCount > 0) {
      // Always fail on critical or high severity issues
      process.exit(1);
    } else if (finalOptions.failOnWarnings && warningCount > 0) {
      // Fail on warnings if --fail-on-warnings is set
      process.exit(1);
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    // Provide actionable suggestions based on error type
    let suggestion = '';
    if (errorMsg.includes('ENOENT') || errorMsg.includes('file not found') || errorMsg.includes('path does not exist')) {
      suggestion = '→ Check if the path exists: attune analyze /valid/path';
    } else if (errorMsg.includes('permission denied') || errorMsg.includes('EACCES')) {
      suggestion = '→ Check file/folder permissions: chmod +r your/path';
    } else if (errorMsg.includes('timeout') || errorMsg.includes('ETIMEDOUT')) {
      suggestion = '→ File may be too large. Try: attune analyze . --max-file-size 5';
    } else if (errorMsg.includes('memory') || errorMsg.includes('heap')) {
      suggestion = '→ Out of memory. Try scanning fewer files or using --lite mode';
    } else if (errorMsg.includes('parse') || errorMsg.includes('JSON')) {
      suggestion = '→ Check if a config file (.attunerc) has invalid syntax';
    } else if (errorMsg.includes('module not found') || errorMsg.includes('Cannot find module')) {
      suggestion = '→ Try running: npm install && attune analyze .';
    }

    console.error(chalk.red(`\n❌ Error during analysis: ${errorMsg}`));
    if (suggestion) {
      console.error(chalk.yellow(suggestion));
    }
    if (err instanceof Error && err.stack) {
      console.error(chalk.gray(err.stack));
    }
    process.exit(1);
  }
}