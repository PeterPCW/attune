# Attune CLI Guide

This guide covers Attune's CLI usage, output formats, and common workflows.

## Quick Reference

```bash
# Basic scan (uses .attunerc if present)
attune analyze .

# With specific options
attune analyze . --security          # Security-focused scan
attune analyze . --full              # Full scan (all rules)
attune analyze . --json              # JSON output
attune analyze . --html              # HTML report

# Discovery commands
attune frameworks                    # List supported frameworks
attune project-types                  # List project types
```

## Scan Modes

### Lite Mode (Default)

Runs critical and high severity rules (~50 rules). Fast feedback for common issues.

```bash
attune analyze .          # Explicit lite mode (same as default)
attune analyze . --lite    # Same as above
```

**Use when:**
- Quick feedback during development
- CI pipeline quick checks
- Working on large codebases

### Full Mode

Runs all rules (150+ rules). More thorough but slower.

```bash
attune analyze . --full
```

**Use when:**
- Comprehensive review
- Release preparation
- First-time analysis of a codebase

**Note:** `--full` bypasses `.attunerc` config file to ensure a consistent, complete scan.

## Category Filters

Run only specific categories of rules:

```bash
attune analyze . --security      # Security rules only
attune analyze . --architecture  # Architecture rules only
attune analyze . --performance   # Performance rules only
attune analyze . --testing       # Testing rules only
```

These run the category rules alongside lite rules (not category in isolation).

## Output Formats

### Terminal (Default)

Color-coded output for terminal display:

```bash
attune analyze .
# Output:
# 📊 Attune Lite Report
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔴 Critical Issues (2)
#    • RULE_ID: src/file.ts:42
#    • RULE_ID: src/other.ts:15
```

### JSON

Machine-readable output for CI/CD:

```bash
attune analyze . --json
# Creates: .attune/reports/attune-TIMESTAMP.json
```

### HTML

Shareable report with styling:

```bash
attune analyze . --html
# Creates: .attune/reports/attune-TIMESTAMP.html
```

### Markdown

Documentation-friendly output:

```bash
attune analyze . --markdown
# Creates: .attune/reports/attune-TIMESTAMP.md
```

### SARIF

Standard format for security tooling integration:

```bash
attune analyze . --sarif
# Creates: .attune/reports/attune-TIMESTAMP.sarif
```

## Explain Files

Attune generates an additional `.explain.md` file with each scan containing:

- What each rule catches
- How to fix identified issues
- File locations requiring attention

This is enabled by default. To disable:

```bash
attune analyze . --no-explain
```

## Configuration Files

### .attunerc

Configuration file for default flags. Created on first run:

```bash
# Example .attunerc
--lite
# --full          # Uncomment for full scans
# --json          # Uncomment for JSON output
# --public-safe   # Uncomment to redact paths
```

**Config file flags:**
- `--lite`, `--full` - Scan mode
- `--json`, `--html`, `--markdown`, `--sarif` - Output format
- `--security`, `--architecture`, `--performance`, `--testing` - Categories
- `--verbose` - Detailed output
- `--public-safe`, `--no-paths`, `--redact-secrets` - Privacy options

**Validation:** Invalid flags in `.attunerc` will show a warning.

### .attuneignore

Patterns to exclude from scanning. Similar to `.gitignore`:

```
# Files to ignore
**/node_modules/**
**/dist/**
*.test.ts
```

#### Rule-Specific Ignores

Skip specific rules on specific files:

```
# Format: RULE_ID:path
OWASP_A08_INTEGRITY_FAIL:src/types/index.ts
ERR_ASYNC_NO_AWAIT:src/cli/handlers/*.ts
```

This is useful for handling false positives while keeping other rules running on the same files.

## Caching

Enable result caching for faster incremental scans:

```bash
attune analyze . --cache
```

First run: Scans all files
Subsequent runs: Only scans changed files

Feedback when caching is active:
```
📦 Cache: 5 of 53 files changed, re-scanning...
📦 Incremental: Analyzing 5 changed files (48 files cached)
```

## Framework & Project Type

### Auto-Detection

Attune automatically detects:
- **Framework:** Based on package.json, config files, and code patterns
- **Project type:** Based on project structure (CLI, library, webapp, etc.)

### Manual Override

```bash
# Specify framework
attune analyze . --framework django

# Specify project type
attune analyze . --project-type saas
```

Discover available options:
```bash
attune frameworks
attune project-types
```

## Common Workflows

### Security Review

```bash
# Quick security check
attune analyze . --security

# Full security scan with report
attune analyze . --security --json --output security-report.json
```

### CI Pipeline

```bash
# JSON output for parsing
attune analyze . --json --store-only

# Exit code 1 if critical issues found
attune analyze . --full
```

### First-Time Analysis

```bash
# Comprehensive scan
attune analyze . --full --html

# Review explain file for fix guidance
cat .attune/reports/attune-*.explain.md
```

### Development Loop

```bash
# Quick feedback (with caching for speed)
attune analyze . --cache

# On changed files only after first run
attune analyze . --cache
```

## Error Handling

Common errors and solutions:

| Error | Solution |
|-------|----------|
| Path does not exist | Check the path exists |
| Permission denied | Check file/folder permissions |
| Out of memory | Use `--lite` or limit with `--max-file-size` |
| Config parse error | Check `.attuneignore` syntax |

## Environment Variables

- `CI=true` - Runs in CI mode, skips file creation

## Getting Help

```bash
attune analyze --help           # CLI options
attune frameworks               # Available frameworks
attune project-types           # Available project types
```

For more, see [README.md](../README.md) and [CHANGELOG.md](../CHANGELOG.md).