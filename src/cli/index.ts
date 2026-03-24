#!/usr/bin/env node

import { Command } from 'commander';
import { analyze } from './commands/analyze.js';
import { getVersion } from './utils/version.js';
import { CliOptions, Framework, ProjectType } from '../types/index.js';

interface AnalyzeOptions {
  lite?: boolean;
  full?: boolean;
  security?: boolean;
  architecture?: boolean;
  performance?: boolean;
  testing?: boolean;
  framework?: Framework;
  projectType?: ProjectType;
  json?: boolean;
  html?: boolean;
  markdown?: boolean;
  sarif?: boolean;
  explain?: boolean;
  verbose?: boolean;
  ignoreDevDeps?: boolean;
  // Safety/privacy options
  publicSafe?: boolean;
  silentSecurity?: boolean;
  noPaths?: boolean;
  redactSecrets?: boolean;
  output?: string;
  storeOnly?: boolean;
  // Config options
  config?: string;
  'no-config'?: boolean;
  // Finding limit options
  maxFindings?: number;
  // Cache options
  cache?: boolean;
  'no-cache'?: boolean;
  // File size limit option (in MB)
  maxFileSize?: number;
  // Metrics option
  metrics?: boolean;
  // Custom rules option
  rulesPath?: string;
  // CI option
  failOnWarnings?: boolean;
}

const program = new Command();

program
  .name('attune')
  .description('Local-first CLI tool for comprehensive code quality checks')
  .version(getVersion());

program
  .command('analyze [path]')
  .description('Analyze a project for code quality issues')
  .option('-l, --lite', 'Run lite checks (critical/high severity, ~50 rules)')
  .option('-f, --full', 'Run full checks (all rules, bypasses .attunerc)')
  .option('-s, --security', 'Run security checks (lite rules + security category)')
  .option('-a, --architecture', 'Run architecture checks (architecture category)')
  .option('-p, --performance', 'Run performance checks (performance category)')
  .option('-t, --testing', 'Run testing checks (testing category)')
  .option('--framework <name>', 'Specify framework (nextjs, react, vue, python, django, etc.)')
  .option('--project-type <type>', 'Override project type (cli, devtool, library, webapp, saas, mobile, desktop, firmware)')
  .option('--json', 'Output as JSON')
  .option('--html', 'Output as HTML (screenshot-ready)')
  .option('--markdown', 'Output as Markdown')
  .option('--sarif', 'Output as SARIF')
  .option('--explain', 'Generate explain file with fixes (default: on, creates .explain.md)')
  .option('--no-explain', 'Disable explain output')
  .option('-v, --verbose', 'Verbose output')
  .option('--ignore-dev-deps', 'Ignore vulnerabilities in devDependencies (for security scans)')
  .option('--public-safe', 'Redact paths and secrets for safe public sharing')
  .option('--silent-security', 'Exclude security findings from output')
  .option('--no-paths', 'Strip file paths from output')
  .option('--redact-secrets', 'Redact detected secrets in code snippets')
  .option('-o, --output <file>', 'Output file path (default: stdout)')
  .option('--store-only', 'Save report without printing to console')
  .option('--config <file>', 'Path to config file (default: .attunerc)')
  .option('--no-config', 'Ignore config file, use .attuneignore only')
  .option('--max-findings <number>', 'Maximum findings per rule (default: 10)')
  .option('--max-file-size <mb>', 'Maximum file size to analyze in MB (default: 1, set to 0 for unlimited)')
  .option('--metrics', 'Output performance metrics after scan')
  .option('--no-cache', 'Disable result caching')
  .option('--cache', 'Enable result caching (default: on, faster incremental scans)')
  .option('--rules-path <path>', 'Path to custom rules JSON file or directory (for plugin rules)')
  .option('--fail-on-warnings', 'Exit with error code if warnings or higher severity issues found (for CI)')
  .action(async (path: string, options: AnalyzeOptions) => {
    const cliOptions: CliOptions = {
      lite: options.lite,
      full: options.full,
      security: options.security,
      architecture: options.architecture,
      performance: options.performance,
      testing: options.testing,
      framework: options.framework,
      projectType: options.projectType,
      json: options.json,
      html: options.html,
      markdown: options.markdown,
      sarif: options.sarif,
      explain: options.explain,  // defaults to true when not specified
      verbose: options.verbose,
      ignoreDevDeps: options.ignoreDevDeps,
      publicSafe: options.publicSafe,
      silentSecurity: options.silentSecurity,
      noPaths: options.noPaths,
      redactSecrets: options.redactSecrets,
      output: options.output,
      storeOnly: options.storeOnly,
      // Config: false means no config, string is path, undefined means use default
      // Note: Commander sets config to false automatically when --no-config is used
      config: options.config,
      // Finding limit per rule
      maxFindings: options.maxFindings,
      // Cache: enabled with --cache flag (opt-in)
      cache: options.cache,
      // File size limit in MB (convert to bytes)
      maxFileSize: options.maxFileSize ? options.maxFileSize * 1024 * 1024 : undefined,
      // Metrics
      metrics: options.metrics,
      // Custom rules path
      rulesPath: options.rulesPath,
      // CI option
      failOnWarnings: options.failOnWarnings
    };

    await analyze(path || '.', cliOptions);
  });

// Frameworks command - list available frameworks
program
  .command('frameworks')
  .description('List available frameworks and languages')
  .action(() => {
    console.log(`
Available Frameworks:
━━━━━━━━━━━━━━━━━━━━━

JavaScript/TypeScript:
  Frontend:  nextjs, react, vue, nuxt, svelte, remix, astro, solidjs, angular
  Server:    express, fastify, nodejs
  Libraries: library

Python:
  Web:       django, fastapi, flask, sqlalchemy
  Async:     celery, aiohttp, starlette
  Data:      pydantic

Run with: attune analyze . --framework <name>
`);
  });

// Project types command - list available project types
program
  .command('project-types')
  .description('List available project types')
  .action(() => {
    console.log(`
Available Project Types:
━━━━━━━━━━━━━━━━━━━━━━━━

  cli       - Command-line tools (has bin field)
  devtool   - Developer tools (eslint, prettier, etc.)
  library   - Reusable packages (has peerDependencies)
  webapp    - Frontend apps (has public/, pages/)
  saas      - Full-stack apps (has models, auth)
  mobile    - Mobile apps (react-native, expo, flutter)
  desktop   - Desktop apps (electron, tauri)
  firmware  - Embedded/IoT code

Project type is auto-detected but can be overridden:
  attune analyze . --project-type saas
`);
  });

program.parse();
