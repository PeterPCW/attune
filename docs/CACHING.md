# Attune Caching Guide

## Overview

Attune uses incremental caching to speed up subsequent scans by only analyzing files that have changed since the last scan.

## How Caching Works

### Cache Storage

- **Location**: `.attune/cache.json` in your project root
- **Format**: JSON containing metadata, file fingerprints, and cached rule results
- **Version**: The cache includes a version string to handle format changes

### Cache Invalidation Triggers

The cache is automatically invalidated when:

1. **Time-based expiration** (default: 24 hours)
   - Cache entries older than 24 hours are considered stale
   - Configurable via `maxCacheAgeMs` in programmatic usage

2. **File modifications**
   - Any change to a file's modification time invalidates its cached result
   - File size changes also trigger invalidation

3. **Dependency changes**
   - Changes to `package.json` invalidate the entire cache
   - This ensures rules that check dependencies are re-run

4. **Manual invalidation**
   - Delete `.attune/cache.json` to force a full re-scan

## CLI Usage

### Enable Caching

Caching is **enabled by default**. No flag needed for incremental scans:

```bash
attune analyze .
```

### Disable Caching

Use `--no-cache` to force a full scan:

```bash
attune analyze . --no-cache
```

### View Cache Status

Use `--verbose` to see cache hits/misses:

```bash
attune analyze . --verbose
```

Output example:
```
📦 Incremental: Analyzing 5 changed files (48 files cached)
```

## Programmatic Usage

### TypeScript API

```typescript
import { CacheManager } from 'attune';

const cache = new CacheManager('/path/to/project', {
  enabled: true,
  maxAgeMs: 24 * 60 * 60 * 1000, // 24 hours
});

// Check if file should be scanned
const shouldScan = cache.shouldScanFile('src/app.ts');

// After scanning, save results
cache.saveResults('src/app.ts', { findingsCount: 3 });
```

### Cache Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | true | Enable/disable caching |
| `maxAgeMs` | number | 86400000 | Cache TTL in milliseconds (24h) |

## Cache Contents

The cache stores:

- **File metadata**: path, modification time, size
- **Rule results**: findings count per file
- **Scan metadata**: last scan time, version

Example cache structure:

```json
{
  "metadata": {
    "version": "1.0.0",
    "lastScan": 1700000000000,
    "projectRoot": "/my/project",
    "packageJsonMtime": 1699999900000
  },
  "files": {
    "src/index.ts": {
      "mtime": 1699999800000,
      "size": 1234
    }
  },
  "ruleResults": {
    "src/index.ts": {
      "TS_NO_IMPLICIT_ANY": {
        "findingsCount": 2,
        "timestamp": 1699999950000
      }
    }
  }
}
```

## Performance Tips

1. **Use caching in CI**: Caching helps in CI too - the cache file can be persisted across runs
2. **Exclude large files**: Files over 1MB are not cached by default
3. **Watch specific directories**: Use `.attuneignore` to exclude directories that change frequently

## Troubleshooting

### Cache causing stale results

If results seem outdated:
1. Run with `--no-cache` to force re-scan
2. Or delete `.attune/cache.json`

### Cache file too large

The cache can grow large in projects with many files. This is normal - each file needs only ~50 bytes. To reduce size:
1. Increase `maxAgeMs` to reduce cache refresh frequency
2. Use `.attuneignore` to exclude unnecessary directories

### CI cache not working

Ensure the `.attune` directory is preserved in CI:
```yaml
# GitHub Actions example
- uses: actions/cache@v3
  with:
    path: .attune
    key: attune-cache-${{ hashFiles('package.json') }}
```
