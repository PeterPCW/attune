# CI/CD Integration Guide

This document provides reference configurations for integrating Attune into your CI/CD pipelines.

---

## GitHub Actions

### Basic Workflow

```yaml
name: Code Quality

on:
  push:
    branches: [main]
  pull_request:

jobs:
  attune:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run Attune
        run: npx attune analyze .

      - name: Upload SARIF results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: attune-results
          path: .attune/reports/
```

### Fail on Critical Issues Only

```yaml
- name: Run Attune
  run: npx attune analyze . --json --output attune-results.json
  continue-on-error: true

- name: Check results
  run: |
    if [ -f attune-results.json ]; then
      CRITICAL=$(jq '.summary.critical // 0' attune-results.json)
      if [ "$CRITICAL" -gt 0 ]; then
        echo "Critical issues found: $CRITICAL"
        exit 1
      fi
    fi
```

### With SARIF for GitHub Advanced Security

```yaml
- name: Run Attune
  run: npx attune analyze . --sarif --output attune.sarif

- name: Upload SARIF to GitHub
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: attune.sarif
    category: attune
```

---

## GitLab CI

### Basic Configuration

```yaml
code-quality:
  image: node:20
  script:
    - npm ci
    - npx attune analyze . --json --output attune-results.json
  artifacts:
    reports:
      sarif: attune-results.json
    when: always
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

### Fail on Critical Issues

```yaml
code-quality:
  image: node:20
  script:
    - npm ci
    - npx attune analyze . --json --output attune-results.json || true
    - |
      CRITICAL=$(jq -r '.summary.critical // 0' attune-results.json)
      if [ "$CRITICAL" -gt 0 ]; then
        echo "Critical issues found: $CRITICAL"
        exit 1
      fi
  allow_failure: false
```

---

## CircleCI

```yaml
workflows:
  version: 2
  build:
    jobs:
      - attune:
          filters:
            branches:
              only: main

jobs:
  attune:
    docker:
      - image: node:20
    steps:
      - checkout
      - run:
          name: Install dependencies
          command: npm ci
      - run:
          name: Run Attune
          command: npx attune analyze .
      - store_artifacts:
          path: .attune/reports/
          destination: attune-reports
```

---

## Jenkins

### Declarative Pipeline

```groovy
pipeline {
    agent any

    stages {
        stage('Code Quality') {
            steps {
                sh 'npx attune analyze . --json --output attune-results.json'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'attune-results.json,.attune/reports/**'
                }
                failure {
                    error('Attune found critical issues')
                }
            }
        }
    }
}
```

---

## Bitbucket Pipelines

```yaml
image: node:20

pipelines:
  default:
    - step:
        name: Code Quality
        script:
          - npm ci
          - npx attune analyze . --json --output attune-results.json
        artifacts:
          - attune-results.json
          - .attune/reports/**
```

---

## Azure DevOps

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'

  - script: |
      npm ci
      npx attune analyze . --json --output $(Build.ArtifactStagingDirectory)/attune-results.json
    displayName: Run Attune

  - task: PublishBuildArtifacts@1
    inputs:
      pathToPublish: $(Build.ArtifactStagingDirectory)
      artifactName: attune-results
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success — no issues at or above failure threshold |
| `1` | Issues found above failure threshold |

### Failure Thresholds

By default, Attune exits with code 1 only for critical and high severity issues. Use `--fail-on-warnings` to also fail on medium/low severity:

```bash
# Default: fail only on critical and high
attune analyze .

# Fail on warnings and above (strict mode for CI)
attune analyze . --fail-on-warnings
```

---

## Configuration Options for CI

### Common Flags

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON for parsing |
| `--sarif` | Output as SARIF for GitHub Advanced Security |
| `--html` | Generate HTML report |
| `--public-safe` | Redact paths/secrets for sharing |
| `--no-paths` | Strip file paths from output |
| `--redact-secrets` | Redact secrets in code snippets |
| `--fail-on-warnings` | Exit with error if medium/low issues found |
| `--metrics` | Output performance metrics |
| `--no-cache` | Disable incremental caching (enabled by default) |

### Filtering by Category

```bash
# Security only
npx attune analyze . --security

# Architecture only
npx attune analyze . --architecture

# Performance only
npx attune analyze . --performance

# Testing only
npx attune analyze . --testing
```

### Using .attuneignore in CI

Attune respects the `.attuneignore` file in your project root. This is useful for:

1. **Handling false positives**: Skip specific rules on specific files
2. **Excluding generated code**: Don't check auto-generated files
3. **CI-specific exclusions**: Exclude files only relevant to local development

```bash
# Example .attuneignore entries for CI:
# Skip a specific rule on a specific file (rule-specific ignore)
OWASP_A08_INTEGRITY_FAIL:src/types/index.ts

# Exclude test files
**/__tests__/**
*.test.ts
```

**Note**: The `.attuneignore` file should be committed to your repository so CI uses the same configuration as local development.

---

## Python / Django / FastAPI / Flask Projects

Attune automatically detects Python projects and their frameworks. Simply run Attune in your project root:

```bash
npx attune analyze .
```

Attune will auto-detect:
- Django projects (by `manage.py`, `settings.py`)
- FastAPI projects (by `main.py`, `app.py` imports)
- Flask projects (by `app.py` imports)
- SQLAlchemy projects
- Celery projects

Python rules are included automatically when applicable to your project type.

---

## Tips

1. **Run lite mode in CI** for faster builds:
   ```bash
   npx attune analyze . --lite
   ```

2. **Use `--public-safe`** when sharing reports externally

3. **Ignore dev dependencies** for faster scans:
   ```bash
   npx attune analyze . --ignore-dev-deps
   ```

4. **Set max findings** to avoid noise:
   ```bash
   npx attune analyze . --max-findings 20
   ```

5. **Store reports as artifacts** — don't let them be lost in CI logs

6. **Use `--fail-on-warnings`** for stricter CI enforcement:
   ```bash
   # Fails on critical, high, AND medium severity issues
   npx attune analyze . --fail-on-warnings
   ```

7. **Caching is enabled by default** - no flag needed for faster incremental scans. Use `--no-cache` to disable:
   ```bash
   npx attune analyze . --no-cache
   ```

8. **Add custom rules** for organization-specific checks:
   ```bash
   npx attune analyze . --rules-path ./company-rules/
   ```

---

## Notes

- Attune should run after dependencies are installed (to detect issues in `node_modules` if needed)
- Consider running Attune as a separate job/step rather than blocking deployments
- Use SARIF integration for native GitHub security dashboard integration
- Exit code handling depends on your quality gates — fail on critical only is usually the right balance
