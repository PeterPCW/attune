# Customizing Attune Rules

This document explains how to customize Attune's behavior for your specific project needs.

## Table of Contents

1. [Using .attunerc](#using-attunerc)
2. [Using .attuneignore](#using-attuneignore)
3. [Scanning Modes](#scanning-modes)
4. [Rule-Specific Configuration](#rule-specific-configuration)
5. [Common Customization Examples](#common-customization-examples)
6. [How Attune Rules Work](#how-attune-rules-work)

---

## Using .attunerc

Attune supports a `.attunerc` config file (similar to ESLint's `.eslintrc`). On first run, Attune creates this file in your project root with default settings.

### Basic Syntax

```
# Comment lines start with #
--json
--use-attuneignore
```

### Available Options

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

### Example .attunerc

```bash
# Default Attune Configuration

# Output format
--json

# Use .attuneignore patterns (recommended)
--use-attuneignore
```

---

## Using .attuneignore

Attune respects a `.attuneignore` file in your project root, similar to `.gitignore`. Use it to exclude files or directories from analysis.

### Basic Syntax

```
# Comment lines start with #
path/to/file.ts
*.test.ts
**/dist/**
node_modules/
```

### Common Patterns

```gitignore
# Exclude test files from analysis
**/__tests__/**
**/*.test.ts
**/*.spec.ts

# Exclude build outputs
dist/
build/
out/

# Exclude dependencies
node_modules/

# Exclude specific directories
**/coverage/**
**/.next/**
**/.nuxt/**
```

### Default .attuneignore

Attune creates a default `.attuneignore` on first run:

```
# Attune ignore patterns
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
```

---

## Scanning Modes

Attune supports three scanning modes:

### 1. Default Mode (Recommended)
Uses both `.attunerc` config file and `.attuneignore` patterns:

```bash
attune analyze .
```

### 2. Full Mode
Bypasses the config file and runs all checks:

```bash
attune analyze . --full
# or
attune analyze . -f
```

### 3. No-Config Mode
Ignores `.attunerc` but still respects `.attuneignore`:

```bash
attune analyze . --no-config
```

---

## Rule-Specific Configuration

Attune rules can be customized within the rule files themselves. Here's how we handle common cases in our own codebase:

### Skip Files by Path

Many rules in Attune check if files should be skipped based on their path:

```typescript
detect(context: AnalysisContext): Finding[] {
  const findings: Finding[] = [];

  for (const file of context.files) {
    // Skip rule definition files to avoid self-detection
    if (file.path.includes('/rules/')) continue;

    // Skip formatter files - they often have longer functions
    if (file.path.includes('/formatters/')) continue;

    // Skip CLI files - they use patterns that may trigger false positives
    if (file.path.includes('/cli/')) continue;

    // Your rule logic here
  }

  return findings;
}
```

### Skip Patterns for Valid Code

Some rules check for specific patterns that indicate intentional usage:

```typescript
// Skip if using Commander.js which provides help/version automatically
if (content.includes("from 'commander'") || content.includes('from "commander"')) {
  continue;
}

// Skip files with eslint-disable comments (they're already suppressing warnings)
if (file.content.includes('eslint-disable')) {
  continue;
}
```

---

## Common Customization Examples

### 1. Skip Console.log Warnings in CLI Tools

CLI tools often legitimately use `console.log` for output:

```typescript
// In the LOG_CONSOLE_LOG rule
if (file.path.includes('/cli/')) continue;
```

### 2. Allow Array Mutations in Analyzers

Code that collects findings may need to use `.push()`:

```typescript
// Skip core files that collect findings into arrays
if (file.path.includes('/core/') || file.path.includes('/analyzer/')) continue;
```

### 3. Accept Dynamic Types for package.json

Reading package.json dynamically requires `any` types:

```typescript
// Using eslint-disable for intentional any usage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function detectFramework(packageJson: Record<string, any>): Framework {
  // ...
}
```

### 4. Allow Longer Functions in Formatters

Formatter functions often need to be longer due to their nature:

```typescript
// Skip formatter files
if (file.path.includes('/formatters/')) continue;
```

### 5. Accept Specific Error Handling Patterns

Analyzers may intentionally catch errors to continue processing:

```typescript
// Skip analyzer/core files - they intentionally catch errors
if (file.path.includes('/core/') || file.path.includes('/analyzer/')) continue;
```

---

## How Attune Rules Work

### Rule Structure

Each rule extends `BaseRule` and implements a `detect()` method:

```typescript
class MyRule extends BaseRule {
  id = 'MY_RULE_ID';
  name = 'Human readable name';
  category: Category = 'category';
  severity: Severity = 'medium';
  frameworks: Framework[] = []; // Empty = all frameworks

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    for (const file of context.files) {
      // Check for the issue
      if (/* condition */) {
        findings.push(this.createFinding(
          context,
          file.path,
          lineNumber,
          'Message',
          'code snippet'
        ));
      }
    }

    return findings;
  }
}
```

### Accessing File Information

```typescript
for (const file of context.files) {
  // Check file extension
  if (!file.path.endsWith('.ts')) continue;

  // Check directory
  if (file.path.includes('/src/components/')) continue;

  // Get content
  const content = file.content;

  // Get lines
  const lines = content.split('\n');
}
```

### Creating Findings

```typescript
findings.push(this.createFinding(
  context,           // AnalysisContext
  file.path,         // File path
  lineNumber,        // Line number (optional)
  'Issue message',  // Description
  'code snippet'    // Optional code reference
));
```

---

## Best Practices

1. **Use .attuneignore for files, not rule logic** - Exclude test files, build outputs, and dependencies at the project level

2. **Use .attunerc for CLI defaults** - Configure default options in .attunerc for consistent team usage

3. **Add eslint-disable comments sparingly** - Only when the code is intentionally using a pattern that would normally be flagged

4. **Document your customizations** - If you modify rules to accept certain patterns, document why in code comments

5. **Consider if the rule needs updating** - If you find yourself frequently skipping a rule's warnings, consider whether the rule itself needs improvement

---

## Related Files

- `.attunerc` - CLI default configuration
- `.attuneignore` - File exclusion patterns
- `src/rules/` - Rule definitions
- `src/types/index.ts` - Type definitions for rules
