# Configuration Guide

This guide covers all configuration options for Attune.

## Quick Reference

| File | Purpose | Format |
|------|---------|--------|
| `.attunerc` | CLI default flags | One flag per line |
| `.attuneignore` | Exclude files/patterns | Glob patterns |
| `.attuneignore` (rule-specific) | Exclude rules on files | `RULE_ID:path` |

## .attunerc

A config file for default CLI flags. Attune creates one on first run.

```bash
# Example .attunerc
--json
--security
# Comments start with #
```

### What works in .attunerc

Only **boolean flags** (no values) work in `.attunerc`:

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON |
| `--html` | Output as HTML report |
| `--markdown` | Output as Markdown |
| `--sarif` | Output as SARIF |
| `--lite` | Run lite checks (~25s) |
| `--full` | Run full checks |
| `--security` | Run security checks only |
| `--architecture` | Run architecture checks only |
| `--performance` | Run performance checks only |
| `--testing` | Run testing checks only |
| `--verbose` | Verbose output |
| `--ignore-dev-deps` | Skip devDependencies in security checks |
| `--public-safe` | Redact paths and secrets for sharing |
| `--silent-security` | Don't show security success messages |
| `--no-paths` | Strip file paths from output |
| `--redact-secrets` | Redact detected secrets |
| `--use-attuneignore` | Use .attuneignore patterns (default) |
| `--no-cache` | Disable result caching |

## .attuneignore

Exclude files and directories from scanning.

```bash
# Ignore test files
**/__tests__/**
**/*.test.ts
**/*.spec.ts

# Ignore build outputs
dist/
build/

# Ignore dependencies
node_modules/
```

### Rule-Specific Ignores

Skip specific rules on specific files:

```bash
# Skip a rule on a specific file
OWASP_A08_INTEGRITY_FAIL:src/types/index.ts

# Skip a rule on multiple files (glob pattern)
ERR_ASYNC_NO_AWAIT:src/cli/handlers/*.ts
```

## CLI Options

These options must be passed on the command line (not in `.attunerc`):

### Scan Options

| Flag | Description |
|------|-------------|
| `--framework <name>` | Specify framework (nextjs, react, vue, django, fastapi, etc.) |
| `--project-type <type>` | Override project type (cli, library, webapp, saas, mobile, desktop, devtool, firmware) |
| `--cache` | Enable result caching for faster incremental scans |
| `--no-cache` | Disable result caching |
| `--max-file-size <mb>` | Max file size in MB (default: 1, 0 for unlimited) |
| `--max-findings <n>` | Max findings per rule (default: 10) |

### Output Options

| Flag | Description |
|------|-------------|
| `--output, -o <path>` | Output file path |
| `--store-only` | Save to file without printing to console |
| `--metrics` | Output performance metrics after scan |
| `--fail-on-warnings` | Exit with error if warnings or higher found |

### Config Options

| Flag | Description |
|------|-------------|
| `--config <file>` | Path to config file (default: .attunerc) |
| `--no-config` | Ignore config file, use .attuneignore only |

### Boolean Flags (CLI or .attunerc)

These work in both CLI and `.attunerc`:

| Flag | Short | Description |
|------|-------|-------------|
| `--lite` | `-l` | Run lite checks (~25s) |
| `--full` | `-f` | Run full checks |
| `--security` | `-s` | Run security checks only |
| `--architecture` | `-a` | Run architecture checks only |
| `--performance` | `-p` | Run performance checks only |
| `--testing` | `-t` | Run testing checks only |
| `--json` | | Output as JSON |
| `--markdown` | | Output as Markdown |
| `--html` | | Output as HTML report |
| `--sarif` | | Output as SARIF |
| `--public-safe` | | Redact paths and secrets for public sharing |
| `--silent-security` | | Don't show security success messages |
| `--no-paths` | | Strip file paths from output |
| `--redact-secrets` | | Redact detected secrets |
| `--ignore-dev-deps` | | Skip devDependencies in vulnerability checks |
| `--use-attuneignore` | | Use .attuneignore patterns (default) |
| `--verbose` | `-v` | Verbose output |

## Examples

### CI Pipeline

```bash
# In CI, you typically want:
attune analyze . --json --no-cache --fail-on-warnings
```

### Development with Caching

```bash
# In .attunerc for development:
--json
--cache

# Then just run:
attune analyze .
```

### Security Scan

```bash
# Security-only scan
attune analyze . --security

# In .attunerc:
--security
```

### Custom Rules

```bash
# Load custom rules (CLI only)
attune analyze . --rules-path ./my-rules/
```
