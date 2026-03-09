# Attune GitHub Action

Run Attune code quality analysis in your GitHub CI/CD pipeline.

## Usage

### Basic Usage

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  attune:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: attune/attune-action@v1
```

### With Custom Flags

```yaml
jobs:
  attune:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: attune/attune-action@v1
        with:
          flags: '--security --lite'
```

### With Custom Path

```yaml
jobs:
  attune:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: attune/attune-action@v1
        with:
          path: './packages/my-app'
          flags: '--json --full'
```

## Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `path` | Path to analyze | `.` |
| `flags` | Attune CLI flags | `--json` |

## Outputs

The action uploads `attune-results.json` as an artifact. Access it in subsequent steps:

```yaml
- name: Download results
  uses: actions/download-artifact@v4
  with:
    name: attune-results
```

## Example with PR Comments

This workflow posts results directly to PRs:

```yaml
name: Code Quality

on: [pull_request]

jobs:
  attune:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: attune/attune-action@v1

      - name: Post results to PR
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('attune-results.json', 'utf8'));
            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });

            const body = `## Attune Results\n\nFound ${results.findings?.length || 0} issues`;

            const existing = comments.find(c => c.body.includes('## Attune Results'));
            if (existing) {
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: existing.id,
                body,
              });
            } else {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body,
              });
            }
```

## License

MIT
