import { resolve, join } from 'path';
import { existsSync, mkdirSync, promises as fsPromises } from 'fs';
import { FrameworkDetector } from '../../core/detector/index.js';
import { AttuneAnalyzer } from '../../core/analyzer/index.js';
import { CacheManager } from '../../core/cache/index.js';
import { sanitizeFindings, sanitizeMetadata, checkForSensitiveFiles } from '../../core/sanitizer.js';
import { getScanErrors, clearScanErrors, setVerboseErrors } from '../../core/scanner/index.js';
import { CliOptions, ScanMetadata, Framework, Finding } from '../../types/index.js';
import { formatTerminal } from '../../formatters/terminal.js';
import { formatJson } from '../../formatters/json.js';
import { formatMarkdown } from '../../formatters/markdown.js';
import { formatHtml } from '../../formatters/html.js';
import { formatSarif } from '../../formatters/sarif.js';
import { formatExplain } from '../../formatters/explain.js';
import chalk from 'chalk';

// CLI version and help are managed by commander in cli/index.ts via .version() and .command().configureHelp()

// Default output directory for file-based reports
const DEFAULT_REPORT_DIR = '.attune/reports';

// Default .attuneignore content
const DEFAULT_ATTUNEIGNORE = `# Attune ignore patterns
# Similar to .gitignore

# Test files
**/__tests__/**
**/*.test.ts
**/*.spec.ts
**/test/**
**/tests/**

# Coverage
coverage/
.nyc_output/

# Build outputs
dist/
build/
out/

# Node modules
node_modules/

# Dependencies
package-lock.json
yarn.lock
pnpm-lock.yaml

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Documentation (source)
docs/
*.md

# Attune local outputs (reports, cache, etc.)
.attune/
`;

// Default .attunerc config file content
const DEFAULT_ATTUNERC = `# Attune Configuration File
# This file specifies default flags for attune analyze
# Lines starting with # are comments
# Each flag should be on its own line

# Output format (uncomment your preference)
# --json       # JSON output (good for CI/CD)
# --html       # HTML report (good for sharing)
# --markdown   # Markdown output
# --sarif      # SARIF format (for CI integration)
# Default: terminal-friendly output

# Default scan mode
--lite          # Run lite checks (~25s) - fast feedback
# --full          # Run full checks - comprehensive analysis

# Include .attuneignore patterns (this is the default behavior)
--use-attuneignore

# Safety options for output
# --public-safe   # Redact paths and secrets for public sharing
# --no-paths      # Strip file paths from output
# --redact-secrets # Redact detected secrets in code snippets
`;

// Config file name
const CONFIG_FILE = '.attunerc';

/**
 * Parse a config file and return array of flags
 */
function parseConfigFile(content: string): string[] {
  const lines = content.split('\n');
  const flags: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    flags.push(trimmed);
  }

  return flags;
}

/**
 * Load and apply config file settings
 * Returns modified CliOptions with config applied
 */
async function applyConfig(projectRoot: string, options: CliOptions): Promise<CliOptions> {
  // Determine config file path
  let configPath: string | undefined;
  if (options.config === false) {
    // --no-config was passed, skip config file
    return options;
  } else if (typeof options.config === 'string') {
    // Explicit config path
    configPath = options.config;
  } else {
    // Default: look for .attunerc in project root
    configPath = join(projectRoot, CONFIG_FILE);
  }

  // Check if config file exists
  if (!configPath || !existsSync(configPath)) {
    return options;
  }

  try {
    const configContent = await fsPromises.readFile(configPath, 'utf-8');
    const configFlags = parseConfigFile(configContent);

    if (configFlags.length === 0) {
      return options;
    }

    if (options.verbose) {
      console.log(chalk.gray(`   → Using config: ${configPath}`));
    }

    // Parse config flags and apply to options
    // Command-line flags take precedence over config file

    // Track if user explicitly set any output format on CLI
    const userSetOutputFormat = options.json || options.html || options.markdown || options.sarif;

    const mergedOptions = { ...options };

    for (const flag of configFlags) {
      // Output format flags: only apply from config if user didn't set any on CLI
      if (!userSetOutputFormat) {
        if (flag === '--json') mergedOptions.json = true;
        else if (flag === '--html') mergedOptions.html = true;
        else if (flag === '--markdown') mergedOptions.markdown = true;
        else if (flag === '--sarif') mergedOptions.sarif = true;
      }

      // Other flags: only apply if not already set on CLI
      if (flag === '--lite' && !options.lite) mergedOptions.lite = true;
      else if (flag === '--full' && !options.full) mergedOptions.full = true;
      else if (flag === '--security' && !options.security) mergedOptions.security = true;
      else if (flag === '--architecture' && !options.architecture) mergedOptions.architecture = true;
      else if (flag === '--performance' && !options.performance) mergedOptions.performance = true;
      else if (flag === '--testing' && !options.testing) mergedOptions.testing = true;
      else if (flag === '--verbose' && !options.verbose) mergedOptions.verbose = true;
      else if (flag === '--ignore-dev-deps' && !options.ignoreDevDeps) mergedOptions.ignoreDevDeps = true;
      else if (flag === '--public-safe' && !options.publicSafe) mergedOptions.publicSafe = true;
      else if (flag === '--silent-security' && !options.silentSecurity) mergedOptions.silentSecurity = true;
      else if (flag === '--no-paths' && !options.noPaths) mergedOptions.noPaths = true;
      else if (flag === '--redact-secrets' && !options.redactSecrets) mergedOptions.redactSecrets = true;
      else if (flag === '--use-attuneignore') {
        // This is default behavior - just log it if verbose
        if (options.verbose) {
          console.log(chalk.gray('   → Using .attuneignore patterns'));
        }
      }
    }

    return mergedOptions;
  } catch (err) {
    console.error(chalk.yellow(`⚠️  Failed to read config file: ${err}`));
    throw err;
  }
}

/**
 * Check if we're running in a CI environment
 */
function isCI(): boolean {
  return process.env.CI === 'true' ||
    process.env.GITHUB_ACTIONS === 'true' ||
    process.env.GITLAB_CI === 'true' ||
    process.env.CIRCLECI === 'true' ||
    process.env.TRAVIS === 'true' ||
    process.env.JENKINS_URL !== undefined;
}

/**
 * Initialize Attune in a project: create directories and config files
 * Returns true if this is the first time running Attune in this project
 * In CI environments, skip file creation to avoid polluting the project
 */
async function initializeAttune(projectRoot: string): Promise<boolean> {
  // In CI, don't create any files - just check if this looks like a first run
  if (isCI()) {
    const reportingDir = join(projectRoot, DEFAULT_REPORT_DIR);
    return !existsSync(reportingDir);
  }

  let isFirstRun = false;

  // Create .attune/reporting directory
  const reportingDir = join(projectRoot, DEFAULT_REPORT_DIR);
  if (!existsSync(reportingDir)) {
    mkdirSync(reportingDir, { recursive: true });
    isFirstRun = true;
  }

  // Create .attuneignore if it doesn't exist
  const attuneignorePath = join(projectRoot, '.attuneignore');
  if (!existsSync(attuneignorePath)) {
    await fsPromises.writeFile(attuneignorePath, DEFAULT_ATTUNEIGNORE);
    isFirstRun = true;
  }

  // Add .attune/ to .gitignore if not already there
  const gitignorePath = join(projectRoot, '.gitignore');
  if (existsSync(gitignorePath)) {
    const gitignoreContent = await fsPromises.readFile(gitignorePath, 'utf-8');
    if (!gitignoreContent.includes('.attune/')) {
      const updatedContent = gitignoreContent.trimEnd() + '\n\n# Attune outputs\n.attune/\n';
      await fsPromises.writeFile(gitignorePath, updatedContent);
    }
  } else {
    // Create .gitignore with .attune/ if it doesn't exist
    await fsPromises.writeFile(gitignorePath, '# Attune outputs\n.attune/\n');
  }

  // Create .attunerc config file if it doesn't exist
  const attunercPath = join(projectRoot, CONFIG_FILE);
  if (!existsSync(attunercPath)) {
    await fsPromises.writeFile(attunercPath, DEFAULT_ATTUNERC);
    isFirstRun = true;
  }

  return isFirstRun;
}

/**
 * Show welcome message for first-time users
 */
function showWelcomeMessage(): void {
  console.log(chalk.hex('#d4af37')(`
╔══════════════════════════════════════════════════════════════════╗
║                    👋 Welcome to Attune!                        ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Attune analyzes your code for quality issues:                   ║
║                                                                  ║
║    • Security vulnerabilities                                   ║
║    • Code quality & best practices                              ║
║    • Framework-specific patterns                                 ║
║    • Performance & accessibility                                 ║
║                                                                  ║
║  Quick start:                                                   ║
║    attune analyze .                    # Scan current project    ║
║    attune analyze . --security        # Security only           ║
║    attune analyze . --html            # HTML report             ║
║                                                                  ║
║  Config: .attunerc (edit to customize defaults)                  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `));
}

/**
 * Show smart suggestions based on findings
 */
function showSmartSuggestions(findings: Finding[]): void {
  const categories = new Set(findings.map(f => f.category));
  const severities = { critical: 0, high: 0, medium: 0, low: 0 };
  findings.forEach(f => {
    if (Object.hasOwn(severities, f.severity)) {
      severities[f.severity as keyof typeof severities]++;
    }
  });

  const suggestions: string[] = [];

  // Category-based suggestions
  if (categories.has('security')) {
    suggestions.push('🔒 Run security-only scan: attune analyze . --security');
    suggestions.push('   Or check for secrets: attune analyze . --json | grep -i secret');
  }

  if (categories.has('typescript')) {
    suggestions.push('📘 Fix TypeScript: Run tsc --noEmit to see detailed errors');
    suggestions.push('   Or use: npx tsc --noEmit --pretty');
  }

  if (categories.has('testing')) {
    suggestions.push('🧪 Add tests: Check which files need test coverage');
    suggestions.push('   Run with vitest to see coverage gaps');
  }

  if (categories.has('performance')) {
    suggestions.push('⚡ Performance: Consider adding bundle analysis');
    suggestions.push('   Run: npx attune analyze . --performance');
  }

  if (categories.has('accessibility')) {
    suggestions.push('♿ Accessibility: Run axe-core or Lighthouse for details');
  }

  // Severity-based suggestions
  if (severities.critical > 0 || severities.high > 0) {
    suggestions.push('🎯 Priority: Fix critical/high issues first - they affect production!');
  }

  // Framework-specific suggestions
  const frameworks = new Set(findings.map(f => f.framework).filter(Boolean));
  if (frameworks.has('nextjs')) {
    suggestions.push('📦 Next.js: Run npm run build to see build warnings');
  }

  // General suggestions
  if (findings.length > 20) {
    suggestions.push('💡 Tip: Run attune analyze . --full for comprehensive report');
  }

  suggestions.push('📖 Full report: attune analyze . --html for shareable HTML');

  // Print suggestions
  if (suggestions.length > 0) {
    console.log(chalk.hex('#d4af37')('\n💡 Quick Tips:'));
    suggestions.slice(0, 4).forEach(s => console.log('   ' + s));
  }
}

function getDefaultOutputPath(projectRoot: string, format: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const ext = format === 'html' ? 'html' : format === 'markdown' ? 'md' : format === 'json' ? 'json' : 'sarif';
  return join(projectRoot, DEFAULT_REPORT_DIR, `attune-${timestamp}.${ext}`);
}

// Track if shutdown is requested
let shutdownRequested = false;

// Set up graceful shutdown handlers
function setupGracefulShutdown(): void {
  const handleShutdown = (signal: string) => {
    if (shutdownRequested) return; // Already handling
    shutdownRequested = true;

    console.log(chalk.yellow(`\n⚠️  Received ${signal}. Saving partial results...`));

    // Give the process a moment to print the message
    setTimeout(() => {
      process.exit(128 + (signal === 'SIGINT' ? 2 : 15));
    }, 100);
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

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

  // Set up graceful shutdown handlers
  setupGracefulShutdown();

  try {
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
      const validFrameworks = ['nextjs', 'react', 'vue', 'nuxt', 'svelte', 'remix', 'astro', 'solidjs', 'angular', 'express', 'fastify', 'nodejs', 'library'];
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

    const startTime = Date.now();

    console.log(chalk.blue('⚙️ Running checks...'));

    // Show progress indicator for longer scans
    const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let spinnerIndex = 0;
    let spinnerInterval: NodeJS.Timeout | null = null;

    // Initialize cache manager only if explicitly enabled
    // Security-sensitive users can opt-out of caching with --no-cache
    // Users can explicitly enable with --cache flag
    const cacheEnabled = finalOptions.cache === true;
    const cacheManager = cacheEnabled ? new CacheManager(projectRoot, true) : undefined;

    if (cacheEnabled && finalOptions.verbose) {
      console.log(chalk.gray('   → Cache enabled for incremental scans'));
    }

    const analyzer = new AttuneAnalyzer(projectRoot, framework, options, { cacheManager });

    // Start spinner for non-verbose mode
    if (!finalOptions.verbose && finalOptions.full) {
      spinnerInterval = setInterval(() => {
        process.stdout.write(`\r${chalk.hex('#d4af37')(spinnerChars[spinnerIndex % spinnerChars.length])} Analyzing...`);
        spinnerIndex++;
      }, 100);
    }

    const result = await analyzer.analyze();

    // Stop spinner
    if (spinnerInterval) {
      clearInterval(spinnerInterval);
      process.stdout.write('\r' + ' '.repeat(20) + '\r');
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
        // Append .explain to the output path
        explainOutputPath = outputPath.replace(/(\.[^.]+)$/, '.explain$1');
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

    // Show brag prompt for good scores (if not silent about success)
    if (!finalOptions.silentSecurity && sanitizedFindings.length === 0) {
      console.log(chalk.green('\n🎉 Looking good! Zero issues found. Your code is ready to show off.'));
    } else if (!finalOptions.silentSecurity && sanitizedFindings.length < 5) {
      console.log(chalk.green('\n✨ Great progress! Only a few issues to fix.'));
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

    // Exit with error code if critical issues found
    const criticalCount = sanitizedFindings.filter(f => f.severity === 'critical').length;
    if (criticalCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error(chalk.red(`\n❌ Error during analysis: ${err}`));
    if (err instanceof Error && err.stack) {
      console.error(chalk.gray(err.stack));
    }
    process.exit(1);
  }
}
