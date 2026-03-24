# json-function-engine Integration

This document explains how attune uses [json-function-engine](https://github.com/PeterPCW/json-function-engine) for rule execution.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Attune CLI                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              EngineRuleRegistry (IRuleRegistry)             │
│  • Loads JSON rules from src/rules/functions/              │
│  • Loads TypeScript framework rules (React, Vue, etc.)    │
│  • Loads custom rules from ./rules/                       │
│  • Executes rules and aggregates findings                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  AttuneEngineWrapper                       │
│  • Wraps json-function-engine                             │
│  • Registers attune helpers as custom actions            │
│  • Converts between attune and engine types              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  json-function-engine                       │
│  • Executes conditions (regex, exists, etc.)            │
│  • Executes actions (flag, block, transform, notify)    │
│  • Handles streaming for large files                     │
└─────────────────────────────────────────────────────────────┘
```

## Rule Sources

Attune loads rules from three sources:

1. **Built-in JSON rules** (`src/rules/functions/*.json`)
   - Generic rules in json-function-engine format
   - 545 rules covering security, architecture, performance, etc.

2. **TypeScript framework rules** (`src/rules/*/index.ts`)
   - Framework-specific rules requiring complex detection logic
   - React, Vue, Next.js, Python, Django, FastAPI, etc.
   - 78 framework-specific rules

3. **Custom rules** (`./rules/*.json` in project root)
   - User-defined rules for specific needs
   - Auto-loaded from project's `./rules/` directory

## Key Interfaces

### IRuleRegistry

```typescript
interface IRuleRegistry {
  getRulesForFramework(framework, options, projectType): Promise<DetectionRule[]>;
  getAllRules(): Promise<DetectionRule[]>;
  getRelevantExtensions(framework, options, projectType): Set<string>;
  executeAll(files, framework, options, projectType): Promise<Finding[]>;
}
```

### IHelperRegistry

```typescript
interface IHelperRegistry {
  get(name: string): HelperFunction | undefined;
  has(name: string): boolean;
  keys(): string[];
}
```

## Configuration

The engine can be configured via `EngineOptions`:

```typescript
interface EngineOptions {
  logger?: 'default' | 'silent' | 'verbose';
  builtInRulesDir?: string;  // Default: 'src/rules/functions'
  customRulesDir?: string;   // Default: 'rules'
  cwd?: string;              // Working directory
}
```

## Error Handling

- **Log-and-continue**: One rule failure doesn't stop the scan
- **Circuit breaker**: After 5 consecutive failures, stops executing new rules
- **Timeout**: 30 second timeout per rule prevents hangs

## Performance

- **Streaming**: Large files (>1MB) are processed line-by-line
- **Lazy loading**: Framework rules only loaded when framework is detected
- **Max findings**: Limited to 10 per rule by default (configurable)

## Adding New Rules

### JSON Rules

Add to `src/rules/functions/<category>.json`:

```json
{
  "version": "1.0",
  "functions": [
    {
      "id": "MY_RULE",
      "name": "My Rule",
      "description": "Description of what this rule checks",
      "enabled": true,
      "priority": 1,
      "category": "security",
      "condition": {
        "type": "regex",
        "pattern": "sensitivePattern"
      },
      "action": {
        "type": "flag",
        "severity": "high",
        "message": "Found sensitive data"
      }
    }
  ]
}
```

### TypeScript Rules

For complex detection logic, create a new file in `src/rules/<framework>/index.ts`:

```typescript
import { BaseRule } from '../base-rule.js';

class MyCustomRule extends BaseRule {
  id = 'MY_CUSTOM_RULE';
  name = 'My Custom Rule';
  category = 'security';
  severity = 'high';

  detect(context: AnalysisContext): Finding[] {
    // Custom detection logic
    return findings;
  }
}

export class MyFrameworkRules {
  static getRules() {
    return [new MyCustomRule()];
  }
}
```

## Testing

To test the engine integration:

```bash
npm run build
node ./dist/index.js analyze . --security --no-cache
```
