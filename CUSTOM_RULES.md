# Creating Custom Rules for Attune

This guide explains how to create custom rules for Attune to meet your specific needs.

## Overview

Attune is designed to be extensible. You can create custom rules to:

- Enforce organization-specific coding standards
- Check for framework-specific patterns
- Add proprietary security rules
- Implement custom business logic validation

All rules are defined in JSON format using patterns and helper functions. This approach:
- Keeps rules as data, not code
- Eliminates the need for testing rule definitions
- Makes rules easy to share and version control

## Quick Start

### 1. Create a Rule File

Create a new JSON file in your project (e.g., `my-rules.json`):

```json
{
  "rules": [
    {
      "id": "MY_INTERNAL_API",
      "name": "Use internal API client",
      "category": "architecture",
      "severity": "high",
      "frameworks": [],
      "catches": [
        "Inconsistent API calling patterns",
        "Missing centralized error handling",
        "No request logging"
      ],
      "fix": [
        "Use InternalAPIClient for all API calls",
        "Configure base URL and auth token once",
        "Enable built-in request logging"
      ],
      "recommendation": {
        "title": "Use our internal API client",
        "description": "All API calls should use InternalAPIClient for consistency.",
        "library": "@company/api-client"
      },
      "patterns": [
        {
          "type": "regex",
          "pattern": "fetch\\s*\\(",
          "message": "Use InternalAPIClient instead of fetch"
        }
      ]
    }
  ]
}
```

### 2. Use Custom Rules

Load your JSON rules into the analyzer:

```typescript
import { AttuneAnalyzer, loadRulesFromJson } from 'attune';

const analyzer = new AttuneAnalyzer('./src', 'react', {});

// Load rules from JSON file
const customRules = loadRulesFromJson('/path/to/my-rules.json');

// Register custom rules
for (const rule of customRules) {
  analyzer.registerRule(rule);
}

const findings = await analyzer.analyze();
```

## JSON Rule Format

### Basic Structure

```json
{
  "rules": [
    {
      "id": "RULE_ID",
      "name": "Human readable name",
      "category": "security|performance|architecture|...",
      "severity": "critical|high|medium|low|info",
      "frameworks": ["react", "nextjs", ...],
      "catches": ["What problems this rule detects"],
      "fix": ["How to fix the issue"],
      "recommendation": {
        "title": "Fix title",
        "description": "What to do",
        "library": "Optional library name"
      },
      "patterns": [...],
      "helpers": [...]
    }
  ]
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique rule identifier |
| `name` | string | Yes | Human-readable name |
| `category` | string | Yes | Category (security, performance, architecture, etc.) |
| `severity` | string | Yes | critical, high, medium, low, or info |
| `frameworks` | string[] | Yes | Applicable frameworks, empty = all |
| `catches` | string[] | Yes | What problems this rule detects |
| `fix` | string[] | Yes | How to fix the issue |
| `recommendation` | object | Yes | Fix guidance |
| `patterns` | object[] | No | Regex patterns to match |
| `helpers` | object[] | No | Helper functions to use |

### Patterns

Simple regex-based detection:

```json
{
  "patterns": [
    {
      "type": "regex",
      "pattern": "console\\.log",
      "message": "Remove console.log statements"
    },
    {
      "type": "regex",
      "pattern": "fetch\\s*\\(",
      "excludePatterns": ["test", "mock"],
      "message": "Use API client instead of fetch"
    }
  ]
}
```

### File Extensions

Rules can be scoped to specific file types using the `fileExtensions` property:

```json
{
  "patterns": [
    {
      "type": "regex",
      "pattern": "dangerouslySetInnerHTML",
      "message": "XSS risk via innerHTML",
      "fileExtensions": [".jsx", ".tsx", ".vue", ".svelte"]
    }
  ]
}
```

This is critical for rules that should only apply to certain file types:
- **React rules** → `.jsx`, `.tsx`
- **Vue rules** → `.vue`, `.ts`
- **Svelte rules** → `.svelte`, `.ts`
- **Security rules** → Usually universal, but specific ones like XXE → `.js`, `.ts`, `.xml`
- **TypeScript rules** → `.ts`, `.tsx`

**Important**: Avoid overly generic patterns in rules without `fileExtensions`. For example, a pattern like `"react"` will match ANY file containing that string (including package.json), causing false positives. Always scope rules appropriately.

### Frameworks

Rules can also be scoped to specific frameworks:

```json
{
  "id": "MY_REACT_RULE",
  "frameworks": ["react"],
  "patterns": [...]
}
```

When `frameworks` is empty `[]`, the rule applies to all projects. When specified, the rule only runs for projects using those frameworks.

### Helpers

For complex detection logic, use helper functions:

```json
{
  "helpers": [
    {
      "name": "findHardcodedSecret",
      "params": {
        "patterns": ["api[_-]?key", "secret[_-]?key"],
        "message": "Hardcoded secret detected",
        "skipComments": true,
        "checkAssignment": true
      }
    }
  ]
}
```

## Available Helper Functions

Attune provides built-in helper functions for common patterns.

### Core Helpers

| Helper | Description |
|--------|-------------|
| `findOnLines` | Find patterns on specific lines |
| `findWithExclusions` | Find patterns with exclusion zones |
| `findImport` | Find specific import patterns |
| `findDependency` | Find dependency usage |
| `findFrameworkSpecific` | Run only for specific frameworks |

### Security Helpers

| Helper | Description |
|--------|-------------|
| `findHardcodedSecret` | Detect hardcoded API keys, passwords, tokens |
| `findSensitiveLogging` | Detect sensitive data in logs |
| `findUrlCredentials` | Detect credentials in URLs |
| `findInsecureCookie` | Detect cookies without secure flags |
| `findDisabledCertValidation` | Detect disabled certificate validation |

### Complexity Helpers

| Helper | Description |
|--------|-------------|
| `findLargeFiles` | Detect files exceeding line count |
| `findHighComplexity` | Detect high cyclomatic complexity |

### Framework Helpers

| Helper | Description |
|--------|-------------|
| `findReactHook` | Detect React hook usage |
| `findInlineHandler` | Detect inline event handlers |
| `findQuery` | Detect database queries |
| `findExposedNextjsSecrets` | Detect Next.js secret exposure |

## Helper Parameters

### findHardcodedSecret

```json
{
  "name": "findHardcodedSecret",
  "params": {
    "patterns": ["api[_-]?key", "password", "token"],
    "message": "Hardcoded secret detected",
    "skipComments": true,
    "checkAssignment": true,
    "excludeTypes": true
  }
}
```

### findOnLines

```json
{
  "name": "findOnLines",
  "params": {
    "pattern": "console\\.log",
    "message": "Console log found",
    "fileExtensions": [".js", ".ts"],
    "skipPaths": ["node_modules", "dist"]
  }
}
```

### findLargeFiles

```json
{
  "name": "findLargeFiles",
  "params": {
    "maxLines": 500,
    "message": "File exceeds maximum line count"
  }
}
```

### findHighComplexity

```json
{
  "name": "findHighComplexity",
  "params": {
    "threshold": 10,
    "message": "High cyclomatic complexity detected"
  }
}
```

## Creating a Rules Plugin

### Structure

```
my-attune-rules/
├── package.json
├── index.ts
└── rules/
    ├── api-rules.json
    └── security-rules.json
```

### package.json

```json
{
  "name": "@company/attune-rules",
  "version": "1.0.0",
  "main": "index.ts",
  "peerDependencies": {
    "attune": ">=1.0.0"
  }
}
```

### index.ts

```typescript
import { loadRulesFromJson } from 'attune';
import { join } from 'path';

export function getCustomRules() {
  const apiRules = loadRulesFromJson(join(__dirname, 'rules/api-rules.json'));
  const securityRules = loadRulesFromJson(join(__dirname, 'rules/security-rules.json'));
  return [...apiRules, ...securityRules];
}
```

## Best Practices

1. **Use JSON**: All rules should be defined in JSON format
2. **Use Helpers**: Leverage built-in helpers for common patterns
3. **Be Specific**: Write rules that target specific issues
4. **Provide Clear Messages**: Help developers understand what to fix
5. **Include Recommendations**: Tell developers how to fix the issue
6. **Test Thoroughly**: Test rules against real codebases using the analyzer
7. **Document**: Explain what your rule checks and why

## Need a New Helper?

If you need a helper function that doesn't exist, you can:

1. **Request it**: Open an issue on GitHub
2. **Contribute it**: Add helper functions to `src/rules/helpers/index.ts`

## Sharing Rules

- Publish to npm as a package
- Share via GitHub Gists
- Contribute to the main Attune repository

## Troubleshooting

### Rule Not Triggering

1. Check that the framework matches
2. Verify the file extensions are being scanned
3. Ensure the JSON file path is correct
4. Validate JSON syntax

### Performance Issues

- Use simple regex patterns when possible
- Use `excludePatterns` to avoid false positives
- Skip irrelevant files with `skipPaths`

## Support

- Open an issue at: https://github.com/attune/attune/issues
- Join discussions at: https://github.com/attune/attune/discussions
