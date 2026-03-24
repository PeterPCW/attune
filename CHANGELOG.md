# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] - 2026-03-14

#### Security Fixes
- **Fixed Windows path traversal vulnerability** - Scanner now normalizes paths for cross-platform safety

#### Technical Debt
- **Consolidated version to single source** - Version now imported from package.json (no more hardcoded version strings)
- **Fixed TypeScript enum usage** - Changed error codes from enum to const object (fixes TS_ENUM_USAGE rule)
- **Removed busy-wait in retrySync** - Eliminated CPU-intensive polling for file operations
- **Added glob support for rule-specific ignores** - .attuneignore now supports patterns like `*.test.ts` and `src/**/*.ts`

#### Documentation
- **New CONFIG.md** - Complete configuration guide for .attunerc and .attuneignore
- **Streamlined README.md** - Simplified with reference to detailed docs

#### Critical Fixes
- **Fixed hardcoded rule path** - Auto-detects src vs dist folder for production builds
- **Added global finding cap** - Prevents OOM with 10,000 max findings limit
- **Custom rule validation** - Validates structure of user-defined rules before loading

#### Reliability Improvements
- **Configurable circuit breaker** - Timeout and max failures now configurable via EngineOptions
- **Configurable finding limits** - maxFindingsPerRule and globalMaxFindings can be customized
- **Health check API** - Added `getMetrics()` and `resetCircuitBreaker()` methods to EngineRuleRegistry

### Fixed: False Positives
- **OWASP_A03_INJECTION / DB_INJECTION_STRING** - Math operators no longer flagged as SQL injection
- **SEC_DESERIALIZATION** - JSON.parse() no longer flagged (only eval/pickle/yaml.load)
- **SEC_HOMEBREW_CRYPTO** - Regex patterns no longer flagged as crypto
- **DB_N_PLUS_1** - Only triggers on actual DB patterns, not any for loop
- **DJANGO_N_PLUS_1** - Stricter pattern matching, skips migrations/tests
- **ERR_NO_ERROR_BOUNDARY** - Excludes middleware.ts, server components, error.tsx
- **ACCESS_FORM_LABEL** - Recognizes sr-only class for screen reader labels
- **A11Y_PREDICTABLE** - Recognizes aria-label for predictable behavior
- **TS_NEVER_TYPE** - Changed to info severity (exhaustive matching is a best practice)
- **ARCH_CIRCULAR_DEP** - Changed to info (barrel exports are standard pattern)
- **CLEAN_CONSOLE_LOG** - Clarified that console.log is appropriate for CLI tools

### Fixed: JSON Rule Format
- Helper-based rules now use `helpers[]` instead of incorrectly placed in `patterns[]`

### Improved: Framework Detection
- Python detection: checks for manage.py, settings.py, main.py, app.py, pyproject.toml
- Better Django/FastAPI/Flask distinction
- Detects project type from structure (models/, views/, public/, routes/, etc.)

### Added: Python Language Support
- Full support for Python-based frameworks
- **Django:** N+1 queries, missing transactions, mutable defaults, broad exceptions
- **FastAPI:** sync DB in async, missing response models
- **Flask:** app at module level detection
- **SQLAlchemy:** N+1 query detection
- **Celery:** task time limits, pickle serializer, retry config
- **Pydantic, aiohttp, Starlette:** framework-specific rules
- 150+ Python-specific rules implemented
- Auto-detects: pyproject.toml, setup.py, requirements.txt, manage.py

### Added: Project Type Detection
- 8 project types: `cli`, `devtool`, `library`, `webapp`, `saas`, `mobile`, `desktop`, `firmware`
- Auto-detects based on project structure (file directories, package.json, etc.)
- Independent of framework/language - a SaaS can be Django, Rails, or Express
- Categories filtered by project type to reduce false positives

### Added: New CLI Options
- `--no-cache` - Disable result caching (enabled by default for faster incremental scans)
- `--project-type <type>` - Override auto-detected project type

### Added: Config Version Tracking
- Generated config files (.attunerc, .attuneignore) now include version number
- Warns when config version differs from Attune version (helps identify stale suppressions)

### Added: Accessibility (Neuro-inclusion)
- **A11Y_FOCUS_MANAGEMENT** - Focus management after modal/dialog interactions
- Reduced motion, timeout, and error message rules enhanced

### Added: Payment Rules
- **PAYMENT_TOKENIZATION** - Card data not tokenized
- **PAYMENT_CARD_VALIDATION** - Missing card validation
- **PAYMENT_3DS** - 3D Secure not implemented
- **PAYMENT_WEBHOOK** - Webhook not verified
- Plus: PAY_NO_IDEMPOTENCY, PAY_NO_REFUND, PAY_SANDBOX_PROD, PAY_NO_WEBHOOK_RETRY

#### Polish
- **Structured error codes** - New error system with categorized error codes:
  - `SCAN_*` - Scan operation errors
  - `RULE_*` - Rule execution errors
  - `CONFIG_*` - Configuration errors
  - `DETECT_*` - Framework detection errors
  - `SYS_*` - System errors
- **Error utilities** - `createError()`, `isAttuneError()`, `getErrorDescription()`, `mapError()`
- **Caching documentation** - New `docs/CACHING.md` with complete caching guide

---

## [0.8.0] - 2026-03-08

### Overview
Attune is a local-first CLI tool for comprehensive code quality checks. It scans your codebase against 448 built-in rules and outputs detailed reports in multiple formats (Terminal, JSON, HTML, Markdown, SARIF).

### Features
- **448 built-in rules** covering security, performance, accessibility, architecture, error handling, and framework-specific patterns
- **31 AST-based helper functions** for pattern matching to enable checks beyond the capabilities of the JSON rules set
- Multi-format output: Terminal, JSON, HTML, Markdown, SARIF
- Framework auto-detection (React, Next.js, Vue, Svelte, Angular, Nuxt, Astro, Express, Fastify, tRPC, etc.)
- Custom `.attuneignore` and `.attunerc` support
- Configuration args to override default limits and reporting such as: `--max-file-size` (default: 1MB), `--max-findings <n>` (default: 10), and `--public-safe` (redact paths and secrets for public sharing) among many others

### CLI Commands
- `attune analyze` - Run code quality scans
- `--full` - Run all checks
- `--security` - Security-only scanning
- `--architecture` - Architecture-focused scanning
- `--performance` - Performance-focused scanning
- `--html` - Generate HTML report with visualization