# Attune

A local-first CLI tool for comprehensive code quality checks. Attune analyzes your codebase for security vulnerabilities, architectural issues, performance problems, and best practices across multiple frameworks.

## Features

- **448 Built-in Rules** covering security, performance, architecture, and code quality
- **Multi-Framework Support**: React, Next.js, Vue, Svelte, Angular, Nuxt, Astro, Remix, SolidJS, Express, Fastify, tRPC
- **Security Scanning**: OWASP Top 10, secret detection, SQL injection, command injection
- **Architecture Patterns**: MVC, state management, component patterns
- **Performance Checks**: Bundle size, memory leaks, async patterns
- **Accessibility**: WCAG 2.1 compliance checks
- **TypeScript**: Type safety, any usage, enum warnings
- **Configurable**: .attunerc config file with CLI defaults
- **Multiple Output Formats**: JSON, Markdown, HTML, SARIF

## How Rules Work

Attune rules work in two ways:

1. **Direct Detection** (most rules): These detect specific code patterns that are problematic (e.g., SQL injection vulnerabilities, missing error handling)

2. **Best Practice Warnings** (some rules): These warn when recommended patterns aren't found. For example:
   - Rules warning about missing rate limiting, caching, or authentication
   - These help you evaluate whether your project follows security/performance best practices
   - You can decide to: fix it, add a `.attuneignore` entry, or acknowledge it's not needed for your use case

> **Tip**: If you see warnings for patterns that don't apply to your project, you can add them to `.attuneignore`. Community feedback helps us improve rules with more specific detection patterns.

## Installation

```bash
npm install -D attune
# or
npm install -g attune
```

## Quick Start

```bash
# Analyze current directory (uses .attunerc if present)
attune analyze .

# First-run: Creates .attune/reports/, .attuneignore, and .attunerc
```

## Usage

```bash
# Analyze current directory
attune analyze .

# Analyze specific path
attune analyze ./src

# Security checks only
attune analyze . --security

# Architecture checks only
attune analyze . --architecture

# Performance checks only
attune analyze . --performance

# Specify framework
attune analyze . --framework nextjs

# Output formats
attune analyze . --json
attune analyze . --markdown
attune analyze . --html

# Full scan (bypasses config file)
attune analyze . --full

# Skip config file, use .attuneignore only
attune analyze . --no-config
```

## Example Output

### HTML Report

Before fixing issues (score: 45):
![Attune Report - Many Issues](assets/report-before.png)

After fixing all issues (score: 100):
![Attune Report - Perfect Score](assets/report-after.png)

## Configuration

### .attunerc

On first run, Attune creates a `.attunerc` file in your project root:

```bash
# Example .attunerc
--json
--use-attuneignore
```

Available config options (one per line, comments start with #):

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |
| `--html` | Output as HTML report |
| `--markdown` | Output as Markdown |
| `--lite` | Run lite checks (~25s) |
| `--full` | Run full checks |
| `--security` | Run security checks only |
| `--architecture` | Run architecture checks only |
| `--performance` | Run performance checks only |
| `--testing` | Run testing checks only |
| `--verbose` | Verbose output |
| `--ignore-dev-deps` | Skip devDependencies in security checks |
| `--public-safe` | Redact paths and secrets for sharing |
| `--no-paths` | Strip file paths from output |
| `--redact-secrets` | Redact detected secrets |
| `--use-attuneignore` | Use .attuneignore patterns (default) |

### .attuneignore

Create a `.attuneignore` file in your project root to exclude files:

```
# Test files
**/__tests__/**
**/*.test.ts
**/*.spec.ts

# Build outputs
dist/
build/

# Dependencies
node_modules/
```

### Scanning Modes

Attune supports three scanning modes:

1. **Default** (recommended): Uses `.attunerc` config + `.attuneignore`
2. **--full**: Bypasses config file, runs all checks
3. **--no-config**: Ignores `.attunerc`, uses `.attuneignore` only

## Output

Reports are saved to `.attune/reports/`:

```bash
# Report saved to .attune/reports/attune-2024-01-15T10-30-00.json
# Report saved to .attune/reports/attune-2024-01-15T10-30-00.html
```

## Finding Limits

To prevent overwhelming reports, Attune limits each rule to a maximum of 10 findings per scan. The total count is still shown so you know the full scope. Use `.attuneignore` to suppress rules you don't want to see.

```bash
# Example warning when a rule exceeds the limit:
# Rule OWASP_A03_INJECTION: 150 findings, showing top 10. Use .attuneignore to suppress.
```

## NPM Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "attune": "attune analyze .",
    "attune:check": "attune analyze . --security",
    "attune:ci": "attune analyze ."
  }
}
```

## CLI Options

| Option | Description |
|--------|-------------|
| `-l, --lite` | Run lite checks (~25s) |
| `-f, --full` | Run full checks (bypasses config) |
| `-s, --security` | Run security checks only |
| `-a, --architecture` | Run architecture checks only |
| `-p, --performance` | Run performance checks only |
| `-t, --testing` | Run testing checks only |
| `--framework <name>` | Specify framework (nextjs, react, vue, etc.) |
| `--json` | Output as JSON |
| `--markdown` | Output as Markdown |
| `--html` | Output as HTML report |
| `--sarif` | Output as SARIF |
| `--config <file>` | Path to config file (default: .attunerc) |
| `--no-config` | Ignore config file, use .attuneignore only |
| `--public-safe` | Redact paths and secrets for public sharing |
| `--silent-security` | Don't show success messages about security |
| `--no-paths` | Strip file paths from output |
| `--redact-secrets` | Redact detected secrets in code snippets |
| `--ignore-dev-deps` | Skip devDependencies in vulnerability checks |
| `--use-attuneignore` | Use .attuneignore patterns (default) |
| `--output, -o <path>` | Output file path |
| `--store-only` | Save to file without printing to console |
| `-v, --verbose` | Verbose output |
| `--max-file-size <mb>` | Max file size in MB to analyze (default: 1, set 0 for unlimited) |
| `--max-findings <n>` | Max findings per rule (default: 10) |

For more advanced customization, see [CUSTOMIZING.md](./CUSTOMIZING.md).

## Supported Frameworks

- React
- Next.js
- Vue / Nuxt
- Svelte / SvelteKit
- Angular
- Astro
- Remix
- SolidJS
- Express
- Fastify
- tRPC

## Exit Codes

- `0`: Success (no critical issues)
- `1`: Critical issues found

## License

MIT
