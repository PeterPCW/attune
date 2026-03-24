# Contributing to Attune

Thank you for your interest in contributing to Attune! This document outlines the process for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/attune.git
cd attune

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Development Scripts

Several scripts are available to help with rule development:

#### Finding Rules

Search for existing rules by keywords, category, or severity:

```bash
# Search by keywords (searches all fields)
npm run find-rules -- "react"
npm run find-rules -- "sql injection"

# Search by specific ID
npm run find-rules -- --id "REACT"

# Search by category
npm run find-rules -- --category "security"
npm run find-rules -- --category "performance"

# Search by severity
npm run find-rules -- --severity "critical"
npm run find-rules -- --severity "high"

# Combine options
npm run find-rules -- --category "security" --severity "high"
```

This helps you:
- Find if a rule already exists for your idea
- Understand the pattern/structure of similar rules
- See how other rules in a category are structured

#### Listing Extension-Gated Rules

See which rules are scoped to specific file types:

```bash
npm run list-extensions
```

This outputs two tables:
- **Extension-Gated Rules**: Rules that only apply to specific file extensions (e.g., `.ts`, `.tsx`, `.vue`)
- **Framework-Gated Rules**: Rules that only apply to specific frameworks (e.g., react, vue, nextjs)

#### Converting Reports

Convert JSON reports to HTML:

```bash
npm run json2html -- report.json
npm run json2fullhtml -- report.json -o report.html
```

#### Generating Rules Documentation

Generate API documentation for all rules:

```bash
npm run docs:rules
```

This creates:
- `docs/rules.json` - Machine-readable rule definitions
- `docs/RULES.md` - Human-readable rule reference

The documentation includes:
- Rule ID, name, and description
- Severity and category
- What the rule catches (problems it detects)
- How to fix (actionable steps)
- Recommended libraries
- Applicable frameworks and file extensions
- Source file location

This helps users understand, ignore, or report issues with specific rules.

### Adding Python Framework Support

Attune supports Python frameworks (Django, FastAPI, Flask, SQLAlchemy, Celery). To add a new Python framework:

1. Create `src/rules/functions/<framework>.json` with `fileExtensions: [".py", ".pyw"]`
2. Add framework detection in `src/core/detector/index.ts`
3. Add helper functions in `src/rules/python/python-helpers.ts` if needed

Python rules use the same JSON format as JavaScript rules but with `.py` file extensions.

### Project Types

Attune auto-detects 8 project types: `cli`, `devtool`, `library`, `webapp`, `saas`, `mobile`, `desktop`, `firmware`. Rules can be filtered by project type in `src/types/index.ts` via `PROJECT_TYPE_CATEGORIES`.

## Project Structure

```
src/
├── cli/           # CLI commands and entry points
├── core/          # Core analysis engine
├── formatters/    # Output formatters (JSON, Markdown, Terminal)
├── rules/         # Detection rules
│   ├── functions/ # JSON rule definitions (json-function-engine format)
│   ├── helpers/   # Helper functions (Rules SDK)
│   ├── security/  # Security rules (TS for complex logic)
│   ├── react/     # React rules (TS for complex logic)
│   └── ...
└── types/         # TypeScript type definitions
```

## Adding New Rules

All rules should be defined in JSON format in `src/rules/functions/`.

### Creating a JSON Rule

1. Create or edit a JSON file in `src/rules/functions/`
2. Define your rule with patterns and/or helpers
3. Register the category in `src/rules/index.ts` (if new)

> **Tip:** Copy `rule-template.json` from the project root as a starting point.

Example (add to `src/rules/functions/my-category.json`):

```json
{
  "rules": [
    {
      "id": "MY_NEW_RULE",
      "name": "Human readable name",
      "category": "category-name",
      "severity": "high",
      "frameworks": [],
      "catches": [
        "What problems this rule detects",
        "Why this is a problem"
      ],
      "fix": [
        "How to fix the issue",
        "Alternative approaches"
      ],
      "recommendation": {
        "title": "Fix title",
        "description": "What the rule detects and why it matters",
        "library": "Optional: related libraries"
      },
      "patterns": [
        {
          "type": "regex",
          "pattern": "some-pattern",
          "message": "Finding message"
        }
      ],
      "helpers": [
        {
          "name": "findHardcodedSecret",
          "params": {
            "patterns": ["api[_-]?key"],
            "message": "Hardcoded secret detected"
          }
        }
      ]
    }
  ]
}
```

### Register the Rule

In `src/rules/index.ts`, add your category to `JSON_RULE_LOADERS`:

```typescript
const JSON_RULE_LOADERS: Record<string, RuleLoader> = {
  // ... existing loaders
  'my-category': () => loadRulesFromJson('my-category'),
};
```

### Using Helper Functions

Attune provides built-in helper functions for common detection patterns:

- `findOnLines` - Find patterns on lines
- `findHardcodedSecret` - Detect secrets
- `findSensitiveLogging` - Detect sensitive data in logs
- `findUrlCredentials` - Detect credentials in URLs
- `findInsecureCookie` - Detect insecure cookies
- `findLargeFiles` - Detect large files
- `findHighComplexity` - Detect complex code
- `findReactHook` - Detect React hooks
- `findInlineHandler` - Detect inline handlers

Example with helpers:

```json
{
  "helpers": [
    {
      "name": "findHardcodedSecret",
      "params": {
        "patterns": ["api[_-]?key", "password", "token"],
        "message": "Hardcoded secret detected",
        "skipComments": true,
        "checkAssignment": true
      }
    }
  ]
}
```

### Need a New Helper?

If you need detection logic that can't be expressed with existing helpers:

1. Add the helper function to `src/rules/helpers/index.ts`
2. Export it and register in the `helperRegistry`
3. Test in `src/__tests__/helpers.test.ts`

Helper functions are the only code that needs testing - JSON rules are data.

### Contributing Better Patterns

Some rules use "inverted" patterns - they warn when best practices aren't found (like missing rate limiting, caching, or authentication). These are intentionally generic to work across many projects.

**Help us improve!** If you find a rule warning that doesn't apply to your project, or you know of a specific pattern that should trigger instead:

1. Open an issue at https://github.com/yourusername/attune/issues
2. Describe:
   - Which rule is too generic
   - What specific pattern should trigger (e.g., "we use 'throttle' instead of 'rateLimit'")
   - Your framework/framework version

Community feedback helps us create more precise rules that detect specific issues rather than just recommending best practices.

## Rule Best Practices

High-quality rules are critical to Attune's effectiveness. Follow these guidelines when creating or modifying rules.

### Pattern Guidelines

**Do:**
- Use specific function call patterns (e.g., `exec\(`) rather than broad keywords
- Add `fileExtensions` to limit rules to relevant file types
- Use `excludePatterns` to filter out common false positives
- Test patterns on real projects before submitting

**Avoid:**
- Broad keywords that match everywhere (e.g., `TODO`, `FIXME`)
- Generic patterns without context (e.g., just `console.log`)
- Overly complex regex that could cause ReDoS

### Severity Guidelines

| Severity | When to Use |
|----------|-------------|
| `critical` | Security vulnerabilities, data breaches, auth bypass |
| `high` | Significant security risks, major performance issues |
| `medium` | Code smells, minor security concerns, maintainability issues |
| `low` | Style issues, minor best practice violations |
| `info` | Informational suggestions, documentation improvements |

### Rule Quality Checklist

Before submitting a new rule, verify:

- [ ] **No false positives** - Tested on at least 2 real projects
- [ ] **Specific patterns** - Uses function calls or specific constructs, not generic keywords
- [ ] **Appropriate severity** - Matches the impact of the issue
- [ ] **Meaningful recommendation** - Includes `title`, `description`, and `codeExample`
- [ ] **Actionable fix** - Has `catches` and `fix` bullets for explain output
- [ ] **Proper file extensions** - Has `fileExtensions` if applicable to specific types
- [ ] **Valid regex** - All patterns compile without errors

### Example: Good vs Poor Pattern

**Poor pattern** (too broad):
```json
{
  "pattern": "console\\.log",
  "message": "Avoid console.log"
}
```

**Good pattern** (specific and contextual):
```json
{
  "pattern": "console\\.(log|debug|info)\\(",
  "message": "Remove debug logging before production",
  "excludePatterns": ["// DEBUG:", "if \\(debug\\)"]
}
```

### Testing New Rules

1. **Build and run**:
   ```bash
   npm run build
   npm run find-rules -- --id "YOUR_RULE_ID"
   ```

2. **Test on real projects**:
   ```bash
   attune analyze /path/to/project --json
   ```

3. **Check for false positives**:
   - Run on 2-3 different projects
   - Verify findings are actionable
   - Adjust patterns if needed

### Performance Considerations

- Rules with `fileExtensions` are faster (scanner skips irrelevant files)
- Avoid catastrophic backtracking in regex (test at regex101.com)
- Complex rules should use helpers, not complex regex chains

### Validating Rules

Before submitting, validate your rule:

```bash
# Build to check for JSON errors
npm run build

# Find your rule
npm run find-rules -- --id "YOUR_RULE_ID"

# Run on a test project
attune analyze /path/to/test --json
```

Check the output for:
- Rule is detected and runs
- Findings are meaningful (not noise)
- Recommendations are actionable

## Testing

### Helper Function Tests

Add tests in `src/__tests__/helpers.test.ts`:

```typescript
describe('Helper Functions', () => {
  describe('findHardcodedSecret', () => {
    it('should detect hardcoded API keys', () => {
      const context = createContext('nodejs', [{
        path: '/test/config.js',
        content: `const apiKey = "sk_live_abcdefghijklmnopqrst";`
      }]);

      const findings = findHardcodedSecret(context, {
        patterns: ['api[_-]?key'],
        message: 'Hardcoded API key detected',
        skipComments: true,
        checkAssignment: true,
        excludeTypes: true
      });

      expect(findings.length).toBeGreaterThan(0);
    });
  });
});
```

### Integration Tests

For full rule testing, add tests in `src/__tests__/rules-comprehensive.test.ts`:

```typescript
describe('Category Rules', () => {
  describe('MY_NEW_RULE', () => {
    it('should detect the issue', () => {
      const rules = loadRulesFromJson('my-category');
      const rule = rules.find(r => r.id === 'MY_NEW_RULE')!;

      const context = createContext('framework', [{
        path: '/test/file.ts',
        content: `/* code that triggers the rule */`
      }]);

      const findings = rule.detect(context);
      expect(findings.length).toBeGreaterThan(0);
    });
  });
});
```

## Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-new-feature`
3. Make your changes
4. Add tests for new helper functions
5. Ensure all tests pass: `npm test`
6. Commit your changes: `git commit -m 'Add new rule for X'`
7. Push to your fork: `git push origin feature/my-new-feature`
8. Open a Pull Request

## Commit Message Guidelines

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove)
- Reference issues when applicable

## Pull Request Process

1. Ensure all tests pass
2. Update documentation for any changed functionality
3. PRs will be reviewed within 48 hours
4. Address any feedback from reviewers

## Reporting Issues

Found a bug, false positive, or have a suggestion? We'd love to hear from you!

### How to Report

1. **Check existing issues** - Someone may have already reported the problem
2. **Use the issue template** - Helps us understand and reproduce the issue
3. **Be specific** - Include:
   - Rule ID (if applicable)
   - Sample code that triggers the issue
   - Your framework and project type
   - Expected vs actual behavior

### What We're Looking For

- **False positives** - Rules that fire on valid code
- **False negatives** - Issues that should be detected but aren't
- **Missing rules** - Common patterns that should be caught
- **Bug reports** - Crashes, errors, unexpected behavior
- **Feature requests** - Ideas for improvement

### Before You Submit

- Try the latest version (regression may already be fixed)
- Test with `--verbose` for detailed output
- Verify it's not a configuration issue (`.attuneignore`, `.attunerc`)

### Privacy Note

**Attune is 100% local and offline.**

- No data leaves your machine
- No telemetry, analytics, or crash reporting
- No network calls during analysis
- Your code is never sent anywhere

If you report an issue, only the information you voluntarily include in the issue description will be shared. We will never request access to your codebase.

## License

By contributing to Attune, you agree that your contributions will be licensed under the MIT License.
