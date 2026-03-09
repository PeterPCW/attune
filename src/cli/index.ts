#!/usr/bin/env node

import { Command } from 'commander';
import { analyze } from './commands/analyze.js';
import { CliOptions, Framework } from '../types/index.js';

interface AnalyzeOptions {
  lite?: boolean;
  full?: boolean;
  security?: boolean;
  architecture?: boolean;
  performance?: boolean;
  testing?: boolean;
  framework?: Framework;
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
}

const program = new Command();

program
  .name('attune')
  .description('Local-first CLI tool for comprehensive code quality checks')
  .version('0.8.0');

program
  .command('analyze [path]')
  .description('Analyze a project for code quality issues')
  .option('-l, --lite', 'Run lite checks (~25s)')
  .option('-f, --full', 'Run full checks')
  .option('-s, --security', 'Run security checks only')
  .option('-a, --architecture', 'Run architecture checks only')
  .option('-p, --performance', 'Run performance checks only')
  .option('-t, --testing', 'Run testing checks only')
  .option('--framework <name>', 'Specify framework (nextjs, react, vue, etc.)')
  .option('--json', 'Output as JSON')
  .option('--html', 'Output as HTML (screenshot-ready)')
  .option('--markdown', 'Output as Markdown')
  .option('--sarif', 'Output as SARIF')
  .option('--explain', 'Generate actionable explain output alongside main format (default: on)')
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
  .option('--cache', 'Enable result caching for faster incremental scans')
  .action(async (path: string, options: AnalyzeOptions) => {
    const cliOptions: CliOptions = {
      lite: options.lite,
      full: options.full,
      security: options.security,
      architecture: options.architecture,
      performance: options.performance,
      testing: options.testing,
      framework: options.framework,
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
      maxFindings: options.maxFindings ? parseInt(options.maxFindings, 10) : undefined,
      // Cache: enabled with --cache flag (opt-in)
      cache: options.cache,
      // File size limit in MB (convert to bytes)
      maxFileSize: options.maxFileSize ? parseInt(options.maxFileSize, 10) * 1024 * 1024 : undefined
    };

    await analyze(path || '.', cliOptions);
  });

program.parse();
